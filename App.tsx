import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import LandingPage from './src/pages/LandingPage';
import Login from './src/pages/Login'; // Import the new Login page
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './src/hooks/useTheme';
import { SessionContextProvider, useSession } from './src/components/SessionContextProvider'; // Import SessionContextProvider and useSession

// Componente wrapper para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-default text-text-default">
        <p className="text-lg">Carregando autenticação...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  useTheme(); // Inicializa o hook de tema para aplicar as variáveis CSS globalmente
  const [hasVisitedLanding, setHasVisitedLanding] = useLocalStorage<boolean>('ganhospro_has_visited_landing', false);

  const handleEnterApp = () => {
    setHasVisitedLanding(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota para a página de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rota para a interface principal do aplicativo (protegida) */}
        <Route 
          path="/app/*" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        
        {/* Rota inicial: exibe a LandingPage ou redireciona para /app ou /login */}
        <Route 
          path="/" 
          element={
            hasVisitedLanding ? (
              <Navigate to="/app" replace /> // Se já visitou, vai para o app (que será protegido)
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