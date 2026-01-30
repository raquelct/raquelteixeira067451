import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell Component
 * 
 * Wrapper principal da aplicação com layout sticky footer
 * 
 * Features de Nível Sênior:
 * - Sticky/Fixed Navbar no topo
 * - Main content com altura mínima
 * - Sticky Footer sempre no bottom
 * - Responsive container com max-width
 * - Semantic HTML (<nav>, <main>, <footer>)
 * - Previne layout shifts
 * 
 * Arquitetura:
 * - Flexbox para layout vertical
 * - min-h-screen para full height
 * - flex-grow no main para empurrar footer
 */
export const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar - Sticky no topo */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Container com max-width e padding responsivo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer - Sempre no bottom */}
      <Footer />
    </div>
  );
};
