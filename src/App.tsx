import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes'; // Importamos as rotas daqui

function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000,
        }} 
      />
      
      <AppRoutes />
    </>
  );
}

export default App;