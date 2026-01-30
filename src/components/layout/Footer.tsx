/**
 * Footer Component
 * 
 * Footer com informações de copyright e branding
 * Sticky footer pattern para sempre ficar no bottom da página
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-300">
              © {currentYear} <span className="font-semibold">SEPLAG/MT Pet Registry</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Sistema de Registro de Animais de Estimação
            </p>
          </div>

          {/* Additional Info */}
          <div className="text-center md:text-right">
            <p className="text-xs text-gray-400">
              Desenvolvido para o Processo Seletivo SEPLAG/MT
            </p>
            <p className="text-xs text-gray-500 mt-1">
              v1.0.0 - {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
