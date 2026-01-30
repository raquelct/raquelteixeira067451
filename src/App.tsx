import { useEffect, useState } from 'react';
import { Home } from './pages/Home';
import { authStore } from './state/AuthStore';
import type { AuthState } from './types/auth.types';

function App() {
  const [authState, setAuthState] = useState<AuthState>(authStore.getCurrentAuthState());

  useEffect(() => {
    // Subscrição ao AuthStore usando BehaviorSubject
    const subscription = authStore.getAuthState().subscribe((state) => {
      setAuthState(state);
    });

    // Cleanup da subscrição ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {/* Indicador de autenticação */}
      {authState.isAuthenticated && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          ✅ Autenticado
        </div>
      )}

      {/* Renderiza página Home */}
      <Home />
    </>
  );
}

export default App;
