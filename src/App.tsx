import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StatusButton } from './components/shared/StatusButton';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            duration: 4000,
          }} 
        />
        
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <StatusButton />
          <AppRoutes />
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;