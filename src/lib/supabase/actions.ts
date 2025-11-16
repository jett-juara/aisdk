/**
 * Server Actions untuk Dashboard
 * Logout dan auth-related server actions
 */

"use server";

import { redirect } from 'next/navigation';
import { createClient } from './server';

/**
 * Server action untuk logout
 */
export async function logoutAction() {
  const supabase = await createClient();

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }

  redirect('/auth');
}

/**
 * Server action untuk refresh user data
 */
export async function refreshUserData() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'User not authenticated' };
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return { user: profile };
  } catch (error) {
    console.error('Refresh user data error:', error);
    return { error: 'Failed to refresh user data' };
  }
}