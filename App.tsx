import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import LandingPage from './src/pages/LandingPage';
import Login from './src/pages/Login'; // Importar a página de Login
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './src/hooks/useTheme';
import { SessionContextProvider, useSession } from './src/components/SessionContextProvider'; // Importar SessionContextProvider e useSession

// Componente Wrapper para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-default text-text-default">
        <Loader2 className="animate-spin w-10 h-10 text-brand-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  // Inicializa o hook de tema para aplicar as variáveis CSS globalmente
  useTheme(); 

  // Estado para verificar se o usuário já visitou a landing page
  const [hasVisitedLanding, setHasVisitedLanding] = useLocalStorage<boolean>('ganhospro_has_visited_landing', false);

  // Função para marcar que o usuário entrou no app
  const handleEnterApp = () => {
    setHasVisitedLanding(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota para a interface principal do aplicativo, protegida por autenticação */}
        <Route 
          path="/app/*" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        
        {/* Rota de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rota inicial: exibe a LandingPage ou redireciona para /app */}
        <Route 
          path="/" 
          element={
            hasVisitedLanding ? (
              <Navigate to="/app" replace /> // Se já visitou, vai para o app
            ) : (
              <LandingPage onEnterApp={handleEnterApp} /> // Se não, mostra a landing page
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