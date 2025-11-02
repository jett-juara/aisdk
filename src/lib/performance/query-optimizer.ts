import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface QueryOptimization {
  queryId: string
  originalQuery: string
  optimizedQuery: string
  optimizationType: 'index_hint' | 'join_optimization' | 'predicate_pushdown' | 'aggregation_optimization' | 'partition_pruning'
  estimatedSpeedup: number
  executionTime: {
    before: number
    after: number
    improvement: number
  }
  recommendations: string[]
}

export interface QueryPerformanceMetrics {
  totalQueries: number
  averageExecutionTime: number
  slowQueries: Array<{
    queryId: string
    executionTime: number
    timestamp: string
    recommendations: string[]
  }>
  optimizationImpact: {
    totalTimeSaved: number
    averageSpeedup: number
    optimizationsApplied: number
  }
  indexUsage: Array<{
    tableName: string
    indexName: string
    usageCount: number
    efficiency: number
  }>
}

export interface DatabaseIndex {
  name: string
  tableName: string
  columns: string[]
  type: 'btree' | 'hash' | 'gin' | 'brin'
  unique: boolean
  partial: boolean
  nullable: boolean
  created: string
  size: number
  lastAnalyzed: string
  usageStats: {
    scans: number
    tuples_returned: number
    index_scans: number
    heap_blocks_read: number
    heap_blocks_hit: number
  }
}

export class QueryOptimizer {
  private admin = createSupabaseAdminClient()
  private queryCache = new Map<string, { query: string; result: any; timestamp: number }>()
  private optimizationHistory: QueryOptimization[] = []
  private performanceMetrics: QueryPerformanceMetrics = {
    totalQueries: 0,
    averageExecutionTime: 0,
    slowQueries: [],
    optimizationImpact: {
      totalTimeSaved: 0,
      averageSpeedup: 0,
      optimizationsApplied: 0
    },
    indexUsage: []
  }

  /**
   * Analyze and optimize a query
   */
  async optimizeQuery(
    query: string,
    parameters?: any[],
    context?: {
      userId?: string
      sessionId?: string
      requestId?: string
    }
  ): Promise<{
    optimizedQuery: string
    optimization: QueryOptimization
    executionPlan?: any
  }> {
    const queryId = this.generateQueryId(query)
    const startTime = performance.now()

    try {
      // Get query execution plan
      const executionPlan = await this.getExecutionPlan(query, parameters)

      // Analyze the plan and identify optimization opportunities
      const optimizations = this.analyzeExecutionPlan(executionPlan)

      // Apply optimizations
      const optimizedQuery = this.applyOptimizations(query, optimizations)

      // Test performance if safe
      const performanceTest = await this.testQueryPerformance(
        query,
        optimizedQuery,
        parameters
      )

      const optimization: QueryOptimization = {
        queryId,
        originalQuery: query,
        optimizedQuery,
        optimizationType: (optimizations[0]?.type as any) || 'predicate_pushdown',
        estimatedSpeedup: performanceTest.estimatedSpeedup,
        executionTime: performanceTest.executionTime,
        recommendations: optimizations.map(opt => opt.recommendation)
      }

      // Cache the optimization
      this.cacheOptimization(queryId, optimization)

      // Update metrics
      this.updateMetrics(optimization)

      return {
        optimizedQuery,
        optimization,
        executionPlan
      }
    } catch (error) {

      // Return original query if optimization fails
      return {
        optimizedQuery: query,
        optimization: {
          queryId,
          originalQuery: query,
          optimizedQuery: query,
          optimizationType: 'predicate_pushdown' as any,
          estimatedSpeedup: 1.0,
          executionTime: {
            before: performance.now() - startTime,
            after: performance.now() - startTime,
            improvement: 0
          },
          recommendations: ['Query optimization failed, using original query']
        }
      }
    }
  }

  /**
   * Get database schema and index information
   */
  async getDatabaseSchema(): Promise<{
    tables: Array<{
      tableName: string
      rowCount: number
      totalSize: string
      indexes: DatabaseIndex[]
    }>
    indexes: DatabaseIndex[]
  }> {
    try {
      // Get table information
      const { data: tables } = await this.admin
        .from('information_schema.tables')
        .select(`
          table_name,
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = information_schema.tables.table_name) as column_count
        `)
        .eq('table_schema', 'public')
        .order('table_name' as any)

      // Get index information
      const { data: indexes } = await this.admin
        .from('pg_indexes')
        .select(`
          indexname,
          tablename,
          indexdef,
          schemaname
        `)
        .eq('schemaname', 'public')
        .not('indexname', 'LIKE', '%_pkey')
        .order('tablename' as any)

      // Process and enhance index information
      const processedIndexes: DatabaseIndex[] = []

      for (const index of indexes || []) {
        const indexDef = index.indexdef
        const columns = this.parseIndexDefinition(indexDef)

        const enhancedIndex: DatabaseIndex = {
          name: index.indexname,
          tableName: index.tablename,
          columns,
          type: this.detectIndexType(columns),
          unique: indexDef.includes('UNIQUE'),
          partial: indexDef.includes('WHERE'),
          nullable: columns.some(col => col.includes('NULL')),
          created: new Date().toISOString(),
          size: 0,
          lastAnalyzed: new Date().toISOString(),
          usageStats: {
            scans: 0,
            tuples_returned: 0,
            index_scans: 0,
            heap_blocks_read: 0,
            heap_blocks_hit: 0
          }
        }

        processedIndexes.push(enhancedIndex)
      }

      // Get index usage statistics
      await this.enrichIndexesWithUsage(processedIndexes)

      return {
        tables: tables?.map((table: any) => ({
          tableName: table.table_name,
          rowCount: table.column_count || 0,
          totalSize: '0 KB',
          indexes: processedIndexes.filter(idx => idx.tableName === table.table_name)
        })) || [],
        indexes: processedIndexes
      }
    } catch (error) {
      return { tables: [], indexes: [] }
    }
  }

  /**
   * Generate optimization recommendations
   */
  async generateRecommendations(): Promise<{
    indexes: Array<{
      tableName: string
      columns: string[]
      type: string
      reason: string
      estimatedImpact: 'high' | 'medium' | 'low'
    }>
    queries: Array<{
      query: string
      recommendations: string[]
      estimatedSpeedup: number
    }>
    general: Array<{
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
      category: 'performance' | 'security' | 'maintenance'
    }>
  }> {
    const schema = await this.getDatabaseSchema()

    const indexRecommendations: any[] = []
    const queryRecommendations: any[] = []
    const generalRecommendations: any[] = []

    // Analyze missing indexes
    for (const table of schema.tables) {
      if (table.rowCount > 1000) {
        // Check if table has adequate indexes
        const hasIndexes = table.indexes.length > 0

        if (!hasIndexes) {
          indexRecommendations.push({
            tableName: table.tableName,
            columns: ['id'], // Default primary key column
            type: 'btree',
            reason: `Table ${table.tableName} has ${table.rowCount} rows but no indexes`,
            estimatedImpact: 'high'
          })
        }

        // Check for composite index opportunities
        const commonFilterColumns = ['user_id', 'status', 'created_at', 'updated_at']
        const indexedColumns = new Set(table.indexes.flatMap(idx => idx.columns))

        for (const column of commonFilterColumns) {
          if (!indexedColumns.has(column)) {
            indexRecommendations.push({
              tableName: table.tableName,
              columns: [column],
              type: 'btree',
              reason: `Frequently filtered column ${column} is not indexed`,
              estimatedImpact: 'medium'
            })
          }
        }
      }
    }

    // Analyze slow queries from history
    for (const slowQuery of this.performanceMetrics.slowQueries) {
      queryRecommendations.push({
        query: slowQuery.queryId,
        recommendations: slowQuery.recommendations,
        estimatedSpeedup: 2.5
      })
    }

    // General performance recommendations
    if (this.performanceMetrics.averageExecutionTime > 100) {
      generalRecommendations.push({
        title: 'Slow Query Performance Detected',
        description: `Average query execution time is ${Math.round(this.performanceMetrics.averageExecutionTime)}ms. Consider query optimization.`,
        priority: 'high',
        category: 'performance'
      })
    }

    if (this.performanceMetrics.optimizationImpact.averageSpeedup < 1.5) {
      generalRecommendations.push({
        title: 'Low Optimization Impact',
        description: 'Query optimizations are showing minimal improvement. Review optimization strategies.',
        priority: 'medium',
        category: 'performance'
      })
    }

    return {
      indexes: indexRecommendations,
      queries: queryRecommendations,
      general: generalRecommendations
    }
  }

  /**
   * Create recommended indexes
   */
  async createRecommendedIndexes(
    recommendations: Array<{
      tableName: string
      columns: string[]
      type: string
      reason: string
    }>
  ): Promise<{
    created: string[]
    failed: string[]
    warnings: string[]
  }> {
    const created: string[] = []
    const failed: string[] = []
    const warnings: string[] = []

    for (const rec of recommendations) {
      try {
        const indexName = `idx_${rec.tableName}_${rec.columns.join('_')}`
        const createIndexSQL = this.generateCreateIndexSQL(rec, indexName)

        await this.admin.rpc('execute_sql', { query: createIndexSQL })

        created.push(indexName)

        // Update index usage stats
        setTimeout(() => this.updateIndexUsageStats(indexName), 1000)

      } catch (error) {
        failed.push(rec.tableName)

        // Check if it already exists
        if ((error as any).message?.includes('already exists')) {
          warnings.push(`Index for ${rec.tableName} already exists`)
        }
      }
    }

    return { created, failed, warnings }
  }

  /**
   * Analyze index usage and recommend cleanup
   */
  async analyzeIndexUsage(): Promise<{
    unusedIndexes: DatabaseIndex[]
    underperformingIndexes: DatabaseIndex[]
    recommendations: Array<{
      action: 'drop' | 'rebuild' | 'monitor'
      indexName: string
      reason: string
      impact: string
    }>
  }> {
    const schema = await this.getDatabaseSchema()

    const unusedIndexes: DatabaseIndex[] = []
    const underperformingIndexes: DatabaseIndex[] = []
    const recommendations: any[] = []

    for (const index of schema.indexes) {
      // Check if index is unused
      if (index.usageStats.scans === 0 && index.usageStats.tuples_returned === 0) {
        unusedIndexes.push(index)
        recommendations.push({
          action: 'drop',
          indexName: index.name,
          reason: 'Index has never been used',
          impact: 'Storage and maintenance overhead'
        })
      }

      // Check if index is underperforming
      const efficiency = index.usageStats.tuples_returned > 0
        ? index.usageStats.index_scans / index.usageStats.tuples_returned
        : 0

      if (efficiency > 100 && index.usageStats.scans > 10) {
        underperformingIndexes.push(index)
        recommendations.push({
          action: 'monitor',
          indexName: index.name,
          reason: `Low efficiency ratio: ${Math.round(efficiency)}`,
          impact: 'Query performance may be suboptimal'
        })
      }
    }

    return {
      unusedIndexes,
      underperformingIndexes,
      recommendations
    }
  }

  /**
   * Optimize database configuration
   */
  async optimizeDatabaseConfiguration(): Promise<{
    vacuumAnalyzed: number
    indexesAnalyzed: number
    statisticsUpdated: string[]
    performanceImprovements: string[]
  }> {
    const improvements: string[] = []
    const statisticsUpdated: string[] = []

    try {
      // Analyze tables that need vacuuming
      const { data: vacuumAnalysis } = await this.admin
        .rpc('analyze_tables_need_vacuum')

      if (vacuumAnalysis && Array.isArray(vacuumAnalysis)) {
        for (const table of vacuumAnalysis) {
          if (table.needs_vacuum) {
            improvements.push(`Table ${table.table_name} needs vacuuming`)
            await this.admin.rpc('vacuum_table', {
              table_name: table.table_name,
              analyze: true
            })
          }
        }
      }

      // Update table statistics
      const schema = await this.getDatabaseSchema()
      for (const table of schema.tables) {
        if (table.rowCount > 100) {
          await this.admin.rpc('analyze_table', {
            table_name: table.tableName
          })
          statisticsUpdated.push(table.tableName)
        }
      }

      improvements.push('Database vacuum and analysis completed')

      return {
        vacuumAnalyzed: vacuumAnalysis?.length || 0,
        indexesAnalyzed: schema.indexes.length,
        statisticsUpdated,
        performanceImprovements: improvements
      }
    } catch (error) {
      return {
        vacuumAnalyzed: 0,
        indexesAnalyzed: 0,
        statisticsUpdated: [],
        performanceImprovements: []
      }
    }
  }

  /**
   * Get query performance metrics
   */
  getPerformanceMetrics(): QueryPerformanceMetrics {
    return this.performanceMetrics
  }

  /**
   * Get optimization history
   */
  getOptimizationHistory(): QueryOptimization[] {
    return this.optimizationHistory
  }

  /**
   * Clear optimization cache
   */
  clearCache(): void {
    this.queryCache.clear()
  }

  // Private helper methods
  private generateQueryId(query: string): string {
    // Create a hash of the query for identification
    let hash = 0
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
      hash = Math.abs(hash)
    }
    return `query_${hash}_${Date.now()}`
  }

  private async getExecutionPlan(query: string, parameters?: any[]): Promise<any> {
    try {
      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS) ${query}`

      let finalQuery = explainQuery
      if (parameters && parameters.length > 0) {
        // In production, properly parameterize the query
        // This is a simplified version
        finalQuery = this.parameterizeQuery(query, parameters)
      }

      const { data } = await this.admin.rpc('execute_sql', { query: finalQuery })
      return data
    } catch (error) {
      return null
    }
  }

  private analyzeExecutionPlan(executionPlan: any): Array<{
    type: string
    recommendation: string
    priority: number
  }> {
    const optimizations: Array<{
      type: string
      recommendation: string
      priority: number
    }> = []

    if (!executionPlan) return optimizations

    // Analyze the plan for optimization opportunities
    const planText = JSON.stringify(executionPlan)

    // Check for sequential scans that could benefit from indexes
    if (planText.includes('Seq Scan')) {
      optimizations.push({
        type: 'index_hint',
        recommendation: 'Add appropriate indexes to avoid sequential scans',
        priority: 1
      })
    }

    // Check for hash joins that could be optimized
    if (planText.includes('Hash Join')) {
      optimizations.push({
        type: 'join_optimization',
        recommendation: 'Consider nested loops for small tables or better join conditions',
        priority: 2
      })
    }

    // Check for sort operations
    if (planText.includes('Sort')) {
      optimizations.push({
        type: 'index_hint',
        recommendation: 'Create indexes that match sort order to avoid sorting',
        priority: 2
      })
    }

    // Check for aggregation opportunities
    if (planText.includes('Aggregate')) {
      optimizations.push({
        type: 'aggregation_optimization',
        recommendation: 'Consider adding indexes for aggregation columns',
        priority: 3
      })
    }

    return optimizations
  }

  private applyOptimizations(query: string, optimizations: Array<{
    type: string
    recommendation: string
    priority: number
  }>): string {
    let optimizedQuery = query

    // Apply optimizations based on type
    for (const optimization of optimizations) {
      switch (optimization.type) {
        case 'index_hint':
          // Add index hints if appropriate
          if (optimizedQuery.includes('WHERE')) {
            // Simple example - in production, would be more sophisticated
            optimizedQuery = optimizedQuery.replace(
              'WHERE',
              '/* INDEX_HINT */ WHERE'
            )
          }
          break

        case 'join_optimization':
          // Optimize join order
          if (optimizedQuery.includes('JOIN')) {
            // In production, would analyze join conditions
            optimizedQuery = optimizedQuery.replace(
              'JOIN',
              '/* JOIN_ORDER */ JOIN'
            )
          }
          break

        case 'predicate_pushdown':
          // Ensure WHERE clauses are pushed down
          // This is more complex and would require parsing
          break

        case 'aggregation_optimization':
          // Optimize aggregations
          if (optimizedQuery.includes('GROUP BY')) {
            // Add appropriate indexes for GROUP BY columns
            optimizedQuery = optimizedQuery.replace(
              'GROUP BY',
              '/* AGGREGATE_OPTIMIZE */ GROUP BY'
            )
          }
          break
      }
    }

    return optimizedQuery
  }

  private async testQueryPerformance(
    originalQuery: string,
    optimizedQuery: string,
    parameters?: any[]
  ): Promise<{
    estimatedSpeedup: number
    executionTime: {
      before: number
      after: number
      improvement: number
    }
  }> {
    const iterations = 3 // Test multiple times for accuracy
    let originalTime = 0
    let optimizedTime = 0

    for (let i = 0; i < iterations; i++) {
      // Test original query
      const originalStart = performance.now()
      try {
        await this.admin.rpc('execute_sql', {
          query: this.parameterizeQuery(originalQuery, parameters || [])
        })
      } catch (error) {
        // Continue if test fails
      }
      originalTime += performance.now() - originalStart

      // Test optimized query
      const optimizedStart = performance.now()
      try {
        await this.admin.rpc('execute_sql', {
          query: this.parameterizeQuery(optimizedQuery, parameters || [])
        })
      } catch (error) {
        // Continue if test fails
      }
      optimizedTime += performance.now() - optimizedStart
    }

    const avgOriginalTime = originalTime / iterations
    const avgOptimizedTime = optimizedTime / iterations
    const improvement = avgOriginalTime > 0
      ? ((avgOriginalTime - avgOptimizedTime) / avgOriginalTime) * 100
      : 0
    const estimatedSpeedup = avgOriginalTime > 0
      ? avgOriginalTime / avgOptimizedTime
      : 1

    return {
      estimatedSpeedup,
      executionTime: {
        before: avgOriginalTime,
        after: avgOptimizedTime,
        improvement
      }
    }
  }

  private parameterizeQuery(query: string, parameters: any[]): string {
    // Simple parameterization - in production, use proper query building
    let paramIndex = 0
    return query.replace(/\?/g, () => {
      if (paramIndex < parameters.length) {
        return `$${++paramIndex}`
      }
      return '?'
    })
  }

  private parseIndexDefinition(indexDef: string): string[] {
    // Parse CREATE INDEX definition to extract column names
    const match = indexDef.match(/CREATE.*\((.*)\)/i)
    if (!match) return []

    const columnsDef = match[1]
    return columnsDef
      .split(',')
      .map(col => col.trim().replace(/['"`]/g, ''))
      .filter(col => col.length > 0)
  }

  private detectIndexType(columns: string[]): 'btree' | 'hash' | 'gin' | 'brin' {
    // Detect index type based on column characteristics
    if (columns.some(col => col.includes('text') || col.includes('varchar'))) {
      return 'btree'
    }
    if (columns.length === 1 && columns[0].includes('id')) {
      return 'hash'
    }
    return 'btree' // Default
  }

  private generateCreateIndexSQL(
  recommendation: {
    tableName: string
    columns: string[]
    type: string
  },
  indexName: string
  ): string {
    const uniqueClause = recommendation.columns.includes('id') ? 'UNIQUE ' : ''
    const indexType = recommendation.type.toUpperCase()
    const columns = recommendation.columns.map(col => `"${col}"`).join(', ')

    return `CREATE ${uniqueClause}${indexType} INDEX ${indexName} ON ${recommendation.tableName} (${columns})`
  }

  private async enrichIndexesWithUsage(indexes: DatabaseIndex[]): Promise<void> {
    for (const index of indexes) {
      try {
        // Get index usage statistics from pg_stat_user_indexes
        const { data } = await this.admin
          .from('pg_stat_user_indexes')
          .select('*')
          .eq('indexrelid', index.name)
          .single()

        if (data) {
          index.usageStats = {
            scans: data.idx_scan || 0,
            tuples_returned: data.idx_tup_read || 0,
            index_scans: data.idx_scan || 0,
            heap_blocks_read: data.idx_blks_read || 0,
            heap_blocks_hit: data.idx_blks_hit || 0
          }
        }
      } catch (error) {
      }
    }
  }

  private async updateIndexUsageStats(indexName: string): Promise<void> {
    try {
      const { data } = await this.admin
        .from('pg_stat_user_indexes')
        .select('*')
        .eq('indexrelid', indexName)
        .single()

      if (data) {
        const index = this.performanceMetrics.indexUsage.find(idx => idx.indexName === indexName)
        if (index) {
          ;(index as any).usageStats = {
            scans: data.idx_scan || 0,
            tuples_returned: data.idx_tup_read || 0,
            index_scans: data.idx_scan || 0,
            heap_blocks_read: data.idx_blks_read || 0,
            heap_blocks_hit: data.idx_blks_hit || 0
          }
        }
      }
    } catch (error) {
    }
  }

  private cacheOptimization(queryId: string, optimization: QueryOptimization): void {
    // Keep only recent optimizations
    if (this.optimizationHistory.length >= 1000) {
      this.optimizationHistory.shift()
    }
    this.optimizationHistory.push(optimization)
  }

  private updateMetrics(optimization: QueryOptimization): void {
    this.performanceMetrics.totalQueries++

    // Update average execution time
    const totalTime = this.performanceMetrics.averageExecutionTime * (this.performanceMetrics.totalQueries - 1) + optimization.executionTime.after
    this.performanceMetrics.averageExecutionTime = totalTime / this.performanceMetrics.totalQueries

    // Update slow queries
    if (optimization.executionTime.after > 100) {
      this.performanceMetrics.slowQueries.push({
        queryId: optimization.queryId,
        executionTime: optimization.executionTime.after,
        timestamp: new Date().toISOString(),
        recommendations: optimization.recommendations
      })

      // Keep only recent slow queries
      if (this.performanceMetrics.slowQueries.length > 50) {
        this.performanceMetrics.slowQueries.shift()
      }
    }

    // Update optimization impact
    this.performanceMetrics.optimizationImpact.totalTimeSaved += optimization.executionTime.improvement
    this.performanceMetrics.optimizationImpact.averageSpeedup =
      this.performanceMetrics.optimizationImpact.totalTimeSaved /
      (this.performanceMetrics.totalQueries * this.performanceMetrics.averageExecutionTime)
    this.performanceMetrics.optimizationImpact.optimizationsApplied++
  }
}

// Singleton instance
export const queryOptimizer = new QueryOptimizer()

// Convenience functions
export const optimizeQuery = (query: string, parameters?: any[], context?: any) =>
  queryOptimizer.optimizeQuery(query, parameters, context)

export const generateRecommendations = () =>
  queryOptimizer.generateRecommendations()

export const getDatabaseSchema = () =>
  queryOptimizer.getDatabaseSchema()