import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import LandingPage from './src/pages/LandingPage';
import Login from './src/pages/Login';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './src/hooks/useTheme';
import { SessionContextProvider, useSession } from './src/components/SessionContextProvider';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  useTheme(); 
  const [hasVisitedLanding, setHasVisitedLanding] = useLocalStorage<boolean>('ganhospro_has_visited_landing', false);
  const { session, loading } = useSession(); // Usar useSession para verificar o estado de carregamento

  const handleEnterApp = () => {
    setHasVisitedLanding(true);
  };

  // Se a sessão estiver carregando, mostre um spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-default text-text-default">
        <Loader2 className="animate-spin w-10 h-10 text-brand-primary" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota para a interface principal do aplicativo, agora acessível sem autenticação */}
        <Route 
          path="/app/*" 
          element={<AppLayout />} 
        />
        
        {/* Rota de Login, para usuários que desejam acessar recursos premium */}
        <Route path="/login" element={<Login />} />

        {/* Rota inicial: exibe a LandingPage ou redireciona para /app */}
        <Route 
          path="/" 
          element={
            hasVisitedLanding ? (
              <Navigate to="/app" replace />
            ) : (
              <LandingPage onEnterApp={handleEnterApp} />
            )
          } 
        />
        
        {/* Redireciona qualquer outra rota não correspondida para a raiz */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => (
  <SessionContextProvider>
    <AppContent />
  </SessionContextProvider>
);

export default App;