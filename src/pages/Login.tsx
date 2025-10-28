import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../components/SessionContextProvider';
import { DollarSign } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading } = useSession();

  useEffect(() => {
    if (session && !loading) {
      navigate('/app', { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-default text-text-default">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-default p-4">
      <div className="flex items-center justify-center gap-3 mb-8">
        <DollarSign size={48} className="text-brand-primary" />
        <h1 className="text-4xl font-extrabold text-text-heading">GanhosPro</h1>
      </div>
      <div className="w-full max-w-md bg-bg-card p-8 rounded-lg shadow-xl border border-border-card">
        <Auth
          supabaseClient={supabase}
          providers={[]} // No third-party providers unless specified
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'var(--color-brand-primary)',
                  brandAccent: 'var(--color-brand-secondary)',
                  inputBackground: 'var(--color-bg-default)',
                  inputBorder: 'var(--color-border-card)',
                  inputLabel: 'var(--color-text-muted)',
                  inputText: 'var(--color-text-default)',
                  messageBackground: 'var(--color-bg-card)',
                  messageText: 'var(--color-text-default)',
                  messageAction: 'var(--color-brand-primary)',
                  anchorTextColor: 'var(--color-brand-primary)',
                },
              },
            },
          }}
          theme="dark" // Using dark theme to match app's default aesthetic
          redirectTo={window.location.origin + '/app'}
        />
      </div>
    </div>
  );
};

export default Login;