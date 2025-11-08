import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { resetTo } from '../navigation/navigationRef';

export function useGateMain() {
  const navigation = useNavigation();
  
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      
      (async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            if (!cancelled) resetTo('Welcome');
            return;
          }

          // COMMENTED OUT FOR V1.2.0 - Email confirmation disabled (Nov 2025)
          /*
          // Check email confirmation
          const { data: { user } } = await supabase.auth.getUser();
          if (!user?.email_confirmed_at && !cancelled) {
            resetTo('EmailConfirmation');
            return;
          }
          */

          // Check onboarding completion
          const { data } = await supabase
            .from('profiles')
            .select('has_completed_onboarding')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!data?.has_completed_onboarding && !cancelled) {
            resetTo('Onboarding');
          }
        } catch (error) {
          console.error('Error in useGateMain:', error);
          // On error, redirect to Welcome as a safe fallback
          if (!cancelled) resetTo('Welcome');
        }
      })();
      
      return () => { 
        cancelled = true; 
      };
    }, [navigation])
  );
}