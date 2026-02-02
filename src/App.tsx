import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000,
        }} 
      />
      
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;