import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import LandingPage from './src/pages/LandingPage';
import Login from './src/pages/Login';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './src/hooks/useTheme';
import { SessionContextProvider, useSession } from './src/components/SessionContextProvider';

// O ProtectedRoute não será mais usado para o aplicativo principal,
// mas pode ser útil para rotas que *exigem* autenticação para qualquer funcionalidade.
// Por enquanto, vamos removê-lo para permitir o acesso gratuito.
// const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { session, loading } = useSession();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-bg-default text-text-default">
//         <p className="text-lg">Carregando autenticação...</p>
//       </div>
//     );
//   }

//   if (!session) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

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

        {/* Rota para a interface principal do aplicativo (agora acessível sem login) */}
        <Route 
          path="/app/*" 
          element={<AppLayout />} 
        />
        
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