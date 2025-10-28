import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isPremium: boolean;
  loading: boolean;
  setIsPremium: (isPremium: boolean) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);

      if (currentSession?.user) {
        // Fetch premium status from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', currentSession.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('Error fetching user profile for premium status:', error);
          setIsPremium(false);
        } else if (profile) {
          setIsPremium(profile.is_premium);
        } else {
          setIsPremium(false);
        }
      } else {
        setIsPremium(false);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setLoading(false);
      if (initialSession?.user) {
        // Fetch premium status for initial session
        supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', initialSession.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching initial user profile for premium status:', error);
              setIsPremium(false);
            } else if (profile) {
              setIsPremium(profile.is_premium);
            } else {
              setIsPremium(false);
            }
          });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, user, isPremium, loading, setIsPremium }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};