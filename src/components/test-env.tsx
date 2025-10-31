/**
 * Test component to verify environment variables (development only)
 * THIS FILE CAN BE DELETED AFTER VERIFICATION
 */
'use client';

import { useEffect, useState } from 'react';

export default function TestEnvironment() {
  const [envStatus, setEnvStatus] = useState<string>('Loading...');

  useEffect(() => {
    // Test client-side environment variables
    const testEnv = () => {
      const clientVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      };

      const hasRequiredVars = clientVars.NEXT_PUBLIC_SUPABASE_URL && clientVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      setEnvStatus(
        hasRequiredVars
          ? '✅ Client environment variables loaded successfully'
          : '❌ Missing client environment variables'
      );

      // Log masked values for verification
      console.log('🔍 Environment Variables Test:', {
        client: clientVars,
        timestamp: new Date().toISOString()
      });
    };

    testEnv();
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-1 rounded text-xs">
      {envStatus}
    </div>
  );
}