import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  subscription_status: string | null;
  stripe_customer_id: string | null; // Adicionado stripe_customer_id
}

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isPremium: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSessionAndProfile = async () => {
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
          throw profileError;
        }

        if (profileData) {
          setProfile(profileData);
          setIsPremium(profileData.is_premium);
        } else {
          // If no profile found, it might be a new user, profile will be created by trigger
          setProfile(null);
          setIsPremium(false);
        }
      } else {
        setProfile(null);
        setIsPremium(false);
      }
    } catch (error: any) {
      console.error('Error fetching session or profile:', error.message);
      toast.error(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchSessionAndProfile(); // Re-fetch profile on auth state change
      } else {
        setProfile(null);
        setIsPremium(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsPremium(false);
      toast.success('Você foi desconectado.');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast.error(`Erro ao desconectar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      setLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (profileData) {
          setProfile(profileData);
          setIsPremium(profileData.is_premium);
        } else {
          setProfile(null);
          setIsPremium(false);
        }
      } catch (error: any) {
        console.error('Error refreshing profile:', error.message);
        toast.error(`Erro ao atualizar perfil: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SessionContext.Provider value={{ session, user, profile, isPremium, loading, signOut, refreshProfile }}>
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