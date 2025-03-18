'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../types/supabase';

// Create the Supabase client with proper configuration
export const supabase = createClientComponentClient<Database>();

// Add auth state change listener with error handling
supabase.auth.onAuthStateChange((event, session) => {
  try {
    console.log('Supabase auth event:', event);
    switch (event) {
      case 'SIGNED_IN':
        console.log('User signed in:', session?.user?.id);
        break;
      case 'SIGNED_OUT':
        console.log('User signed out');
        break;
      case 'TOKEN_REFRESHED':
        console.log('Token refreshed');
        break;
      case 'USER_UPDATED':
        console.log('User updated:', session?.user?.id);
        break;
      case 'INITIAL_SESSION':
        console.log('Initial session loaded');
        break;
      case 'PASSWORD_RECOVERY':
        console.log('Password recovery requested');
        break;
      case 'MFA_CHALLENGE_VERIFIED':
        console.log('MFA challenge verified');
        break;
    }
  } catch (error: unknown) {
    console.error('Error in auth state change:', error instanceof Error ? error.message : error);
  }
});