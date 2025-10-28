import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../components/SessionContextProvider';
import { Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading } = useSession();

  useEffect(() => {
    if (session) {
      navigate('/app', { replace: true });
    }
  }, [session, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-default text-text-default">
        <Loader2 className="animate-spin w-10 h-10 text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-default p-4">
      <div className="w-full max-w-md bg-bg-card p-8 rounded-lg shadow-xl border border-border-card">
        <h1 className="text-3xl font-bold text-center text-brand-primary mb-6">Bem-vindo ao GanhosPro</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]} // Removendo provedores de terceiros por padrão, adicione se necessário
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
                  inputPlaceholder: 'var(--color-text-muted)',
                  inputText: 'var(--color-text-default)',
                  defaultButtonBackground: 'var(--color-brand-primary)',
                  defaultButtonBorder: 'var(--color-brand-primary)',
                  defaultButtonText: 'var(--color-text-default)',
                  defaultButtonBackgroundHover: 'var(--color-brand-secondary)',
                  defaultButtonTextHover: 'var(--color-text-default)',
                  anchorText: 'var(--color-brand-primary)',
                  anchorTextHover: 'var(--color-brand-secondary)',
                  messageText: 'var(--color-text-default)',
                  messageBackground: 'var(--color-bg-card)',
                  messageBorder: 'var(--color-border-card)',
                },
              },
            },
          }}
          theme="dark" // Usando tema dark para combinar com o app
          localization={{
            variables: {
              sign_in: {
                email_label: 'Seu e-mail',
                password_label: 'Sua senha',
                email_input_placeholder: 'seu@email.com',
                password_input_placeholder: '••••••••',
                button_label: 'Entrar',
                social_auth_message: 'Entrar com',
                link_text: 'Já tem uma conta? Entrar',
              },
              sign_up: {
                email_label: 'Seu e-mail',
                password_label: 'Crie uma senha',
                email_input_placeholder: 'seu@email.com',
                password_input_placeholder: '••••••••',
                button_label: 'Criar conta',
                social_auth_message: 'Criar conta com',
                link_text: 'Não tem uma conta? Criar conta',
              },
              forgotten_password: {
                email_label: 'Seu e-mail',
                email_input_placeholder: 'seu@email.com',
                button_label: 'Enviar instruções de recuperação',
                link_text: 'Esqueceu sua senha?',
              },
              update_password: {
                password_label: 'Nova senha',
                password_input_placeholder: '••••••••',
                button_label: 'Atualizar senha',
              },
              magic_link: {
                email_input_placeholder: 'seu@email.com',
                button_label: 'Enviar link mágico',
                link_text: 'Enviar um link mágico',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;