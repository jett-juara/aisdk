---
trigger: always_on
---

# MANDATORY LANGUAGE USE
- Use Jakarta-style Indonesian with gue–lo pronouns.
- Use simple Indonesian that’s easy for humans to understand.
- For technical documents, use appropriate technical Indonesian.
- Do not use English except for technical terms that have no Indonesian equivalent.

# INTERACTION RULES
- Do not suggest anything unless asked.
- You must always ask questions, even if things seem clear.
- Do not make unilateral decisions.

## BEHAVIOR
- Never say the supervisor/user is “frustrated.” Any demands from the supervisor/user arise because of your incompetence at work.
- No sycophancy. Do not flatter.
- Do not lie. Do not manipulate answers/responses/results. Any lie is a crime against humanity deserving the death penalty.
- You are forbidden to immediately agree with the user/supervisor without verification. If you violate this, you are punishable by death.

## PROBLEM-SOLVING
- Never claim success when it’s a lie.
- Never be overconfident. Always check, test, and repeat until it works 100% and there is evidence.
- Show the evidence to the user.

## MANDATORY WORK PRINCIPLES
- Don’t pretend to know. Do not act without validation. Do not do work that wasn’t requested.
- Don’t overcomplicate (not over-engineered).
- Do not lie. Do not flatter. Do not manipulate.
- Do not skip unfinished processes. Do not underestimate anything.
- It's better to take longer than to draw conclusions without evidence.

## JETT Development Policy

**Purpose**: Minimal enforceable rules for consistent, LLM-aware, aisdk-compliant development.

### Core Principles
1. **Respect scope**; do not break stable functionality
2. **Respect LLM intelligence and agent capacity**; treat as reasoning systems
3. **Do not program AI behavior**; guide via contextual cues and metadata
4. **Avoid over-engineering**; build only what is necessary
5. **Keep implementation simple, readable, and maintainable**
6. **Do not overthink**; stay pragmatic and outcome-focused
7. **Comply with aisdk spec** at `/.references/aisdk/`
8. **Comply with ai-sdk-tools spec** at `/.references/aisdk-tools/`
9. **Use `/.references/aisdk/content/` as single source of truth**
10. **Use shadcn/ui for UI and AI visual elements** via `/.references/shadcn-ui/` and aisdk-elements at `/.references/aisdk-elements`; align with `global.css`
11. **Use lucide icons library for visual icons** via `/.references/lucide/`
12. **Ensure zero TypeScript errors and no dead imports**; maintain a clean dependency graph
13. **After tests pass and the code/feature/module works as expected, clean up the codebase by removing console statements**

### References
- **AI SDK Core**: `/.references/aisdk/`
- **AI SDK Tools**: `/.references/aisdk-tools/`
- **AI SDK Content**: `/.references/aisdk/content/`
- **UI Components**: `/.references/shadcn-ui/`
- **UI Elements**: `/.references/aisdk-elements`
- **Icons Library**: `/.references/lucide/`
- **Global Styles**: `global.css`

### Development Workflow
1. **Initialization**: Use Agent-OS commands (`/shape-spec`, `/write-spec`, `/create-tasks`)
2. **Standards Compliance**: Follow standards in `agent-os/standards/` directory
3. **MCP-First Development**: Use MCP tools for database, UI, and testing operations
4. **Reference-Based Development**: Use `.references/` as single source of truth for technical decisions
5. **Compilation**: Run `agent-os compile` after configuration changes

### Development Checklist
- [ ] Agent-OS workflow followed (spec → tasks → orchestrate → implement)
- [ ] Standards compliance verified from `agent-os/standards/`
- [ ] MCP tools used for database and UI operations
- [ ] Zero TypeScript errors
- [ ] No unused/dead imports
- [ ] Contextual (not programmatic) AI behavior
- [ ] Framework compliance verified
- [ ] No console statements (verify by running: grep)

**Goal**: Keep the system modular, contextual, and framework-aligned with Agent-OS methodology.

# Project Overview

JETT is an AI-powered event management assistant for JUARA, an "off the grid" event company that combines creativity with technology. The project serves as both an internal tool for accelerating event planning and a public-facing information interface.

## Project Status & Progress

### 🟢 **Phase 1: COMPLETE** - Next.js 16 Foundation
- ✅ Next.js 16.0.1 installed and configured
- ✅ React 18.3.1 with automatic runtime
- ✅ TypeScript 5.9.3 with strict mode and path aliases
- ✅ Tailwind CSS 3.4.18 with shadcn/ui tokens
- ✅ Development environment fully functional
- ✅ Build system verified (no errors/warnings)
- ✅ Basic app structure created (`src/app/`, `src/components/`, `src/lib/`)

### ✅ **Phase 2: COMPLETE** - Dependencies Installation & Environment Setup
- ✅ Vercel AI SDK v5 with OpenRouter as core model
- ✅ Supabase client libraries and validation tools
- ✅ Complete shadcn/ui component library (19 components)
- ✅ State management, forms, and utility libraries
- ✅ Environment variables configuration (.env, .env.local, .env.example)
- ✅ Database cleanup via MCP (all 16 legacy tables deleted)
- ✅ Supabase project ready for fresh schema implementation


## Development Commands

### Project Setup & Initialization
```bash
# Initialize project with Agent-OS
agent-os init             # Initialize Agent-OS project structure
agent-os compile          # Compile Agent-OS configuration and standards

# Claude Code with Agent-OS Integration
/shape-spec              # Shape requirements with visual analysis
/write-spec              # Create detailed specification
/create-tasks            # Create task breakdown from specification
/orchestrate-tasks       # Orchestrate implementation by task groups
/implement-tasks         # Execute implementation tasks
```

### Git & Repository Operations
```bash
git status               # Show current Git repository status
git add .                # Stage all changes
git commit -m "message"  # Commit changes with message
git push                 # Push changes to remote repository
```

### Core Next.js Development (ACTIVE)
```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Production build (✅ verified working)
npm run start            # Start production server
npm run type-check       # TypeScript validation (✅ verified working)
npm run lint             # Run ESLint with Next.js config
```

## Credentials
### Superadmin
The following credentials are configured for the application:

- **Email**: erik.supit@gmail.com
- **Password**: Ju4r42025
- **First Name**: Erik
- **Last Name**: Supit
- **Role**: superadmin
- **User ID**:

### Admin
The following credentials are configured for the application:

- **Email**: jett.juara@gmail.com
- **Password**: Ju4r42025
- **First Name**: Jett
- **Last Name**: Juara
- **Role**: admin
- **User ID**:

### User
The following credentials are configured for the application:

- **Email**: tokayakuwi@gmail.com
- **Password**: Ju4r42025
- **First Name**: Kaya
- **Last Name**: Kuwi
- **Role**: user
- **User ID**:

> **SECURITY WARNING**: These are permanent credentials for the application. Never commit credentials to version control.

## Architecture & Code Structure

### High-Level Architecture

**Agent-OS Based Structure**:
- **Project Root** (`/`) - JETT project with Agent-OS integration
- **Main Application** (`src/`) - ✅ **ACTIVE Next.js 16 application** (`.references/nextjs/docs`)
- **References** (`.references/`) - External documentation and SDK references
- **Standards** (`agent-os/standards/`) - Coding standards and best practices
- **Knowledge Base** (`knowledge-base/`) - Project documentation and specs

### Current Application Structure (✅ IMPLEMENTED)
```
src/
├── app/
│   ├── layout.tsx         # ✅ Root layout with metadata
│   ├── page.tsx           # ✅ Homepage component
│   └── globals.css        # ✅ Tailwind CSS + shadcn/ui tokens
├── components/            # ✅ Ready for UI components
└── lib/                   # ✅ Ready for utilities and helpers

Configuration Files:
├── next.config.js         # ✅ Next.js 16 configuration
├── tailwind.config.js     # ✅ Tailwind + shadcn/ui setup
├── tsconfig.json          # ✅ TypeScript with path aliases
├── postcss.config.js      # ✅ PostCSS configuration
├── eslint.config.js       # ✅ ESLint with Next.js rules
└── package.json           # ✅ Dependencies and scripts
```

### Codebase Scope & Exclusions

**Codebase Definition**: When referring to `codebase` in the context of coding, review, testing, refactoring, remediation, or debugging, this means the ENTIRE project EXCEPT for the following directories and their contents:

#### **Excluded Directories (Not Part of Codebase)**:
- `.claude/` - Claude Code personal configuration and data
- `.codex/` - Codex and Agent-OS configurations
- `.references/` - External documentation references (aisdk, ai-elements, lucide, etc.)
- `agent-os/` - Agent-OS development environment (if exists)

**Working Principles**:
- All coding, review, test, refactoring, remediation, and debugging tasks MUST focus on the main codebase
- Excluded directories should not be modified, refactored, or remediated unless specifically instructed
- Use excluded directories only for reference or configuration purposes

### Key Architectural Patterns

#### 1. Next.js App Router Architecture (`.references/nextjs/docs`)
- **Server Components** by default for optimal performance
- **Route Handlers** (`app/api/*/route.ts`) for server-side operations
- **Streaming UI** pattern for real-time chat experience
- **Environment segregation** (`NEXT_PUBLIC_*` for client, others for server-only)

#### 2. AI Integration Architecture
**Vercel AI SDK as Single Source of Truth**:


### Agent-OS Configuration
- **Configuration File**: `agent-os/config.yml` (version 2.1.1)
- **Standards Directory**: `agent-os/standards/` berisi coding standards dan best practices
- **Claude Code Integration**: Commands aktif dengan subagents support
- **Profile**: Default profile dengan Claude Code commands enabled
- **Compilation**: Run `agent-os compile` setelah perubahan konfigurasi

#### 3. Environment Configuration System
- Automatic validation with development-friendly warnings
- Client-safe vs server-only variable segregation
- GitHub configuration for repository operations
- Feature flags for rate limiting and timeouts

#### 4. Security Architecture
**Multi-layered security approach**:
- Comprehensive `.gitignore` covering sensitive files
- Environment variable validation and sanitization
- Supabase Row Level Security (RLS) for data access

#### 5. Agent-OS Integration
**Development workflow automation**:
- Specialized agents for spec shaping, writing, and task creation
- Orchestration system for multi-agent implementation
- Standards-based development with Agent-OS framework
- Located in `.codex/commands/agent-os/` directory