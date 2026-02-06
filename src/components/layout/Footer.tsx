import { PawPrint } from 'lucide-react';
import githubIcon from '../../assets/github-icon.svg';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-2 text-slate-500">
            <PawPrint className="h-5 w-5 text-slate-400" />
            <p className="text-sm">
              © {currentYear} Pet Manager. Todos os direitos reservados.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:inline">
              Desenvolvido para SEPLAG/MT
            </span>
            
            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
              v1.0.0
            </span>

            <a 
              href="https://github.com/raquelct/raquelteixeira067451" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="GitHub Repository"
            >
              <img src={githubIcon} alt="GitHub" className="h-5 w-5 opacity-40 hover:opacity-60 transition-opacity" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};
