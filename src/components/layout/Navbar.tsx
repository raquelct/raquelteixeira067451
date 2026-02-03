import { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { LogOut, User as UserIcon, ChevronDown, Menu as MenuIcon, PawPrint } from 'lucide-react';
import { authFacade } from '../../facades/auth.facade';
import type { User } from '../../types/auth.types';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const authSubscription = authFacade.isAuthenticated$.subscribe(setIsAuthenticated);
    const userSubscription = authFacade.user$.subscribe(setUser);

    return () => {
      authSubscription.unsubscribe();
      userSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authFacade.logout();
      navigate('/login');
    } catch (error) {
      console.error('[Navbar] Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActivePath = (path: string) => location.pathname === path;

  const getNavLinkClass = (path: string) => {
    const active = isActivePath(path);
    return `px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-white/10 text-white shadow-sm'
        : 'text-indigo-100 hover:text-white hover:bg-white/5'
    }`;
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="bg-indigo-600 shadow-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center flex-shrink-0">
              <Link
                to="/"
                className="flex items-center space-x-2 group"
              >
                <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
                  <PawPrint className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">Pet Manager</span>
              </Link>
            </div>

            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1">
                 <div className="h-6 w-px bg-indigo-500/50 mr-2" aria-hidden="true" />
                 
                  <Link
                  to="/"
                  className={getNavLinkClass('/')}
                  >
                  Pets
                  </Link>
                  <Link
                  to="/tutores"
                  className={getNavLinkClass('/tutores')}
                  >
                  Tutores
                  </Link>
                  <Link
                  to="/status"
                  className={getNavLinkClass('/status')}
                  >
                  Status
                  </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <div className="hidden md:block">
                    <Menu as="div" className="relative">
                    <div>
                        <Menu.Button className="flex items-center gap-2 max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 p-1 hover:bg-white/5 transition-colors">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center text-indigo-100 font-bold border border-indigo-400">
                            {getUserInitials(user?.name)}
                        </div>
                        <span className="hidden lg:block text-indigo-100 font-medium text-sm truncate max-w-[150px]">
                            {user?.name?.split(' ')[0]}
                        </span>
                        <ChevronDown className="h-4 w-4 text-indigo-200" aria-hidden="true" />
                        </Menu.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
                        <div className="px-4 py-3">
                            <p className="text-sm text-gray-900 font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate lowercase">{user?.role || 'User'}</p>
                        </div>
                        
                        <div className="py-1">
                            <MenuItem>
                            {({ active }) => (
                                <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className={`${
                                    active ? 'bg-red-50 text-red-700' : 'text-gray-700'
                                } group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                                >
                                <LogOut className={`mr-3 h-4 w-4 ${active ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'}`} aria-hidden="true" />
                                {isLoggingOut ? 'Saindo...' : 'Sair'}
                                </button>
                            )}
                            </MenuItem>
                        </div>
                        </MenuItems>
                    </Transition>
                    </Menu>
                </div>
              </>
            ) : (
                <div className="hidden md:block">
                     <button
                        onClick={handleLogin}
                        className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 shadow-sm"
                    >
                        <UserIcon className="w-4 h-4" />
                        <span>Entrar</span>
                    </button>
                </div>
             
            )}

            <div className="md:hidden flex items-center ml-4">
                <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
                >
                <span className="sr-only">Open main menu</span>
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                </button>
            </div>

          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-indigo-500/30 bg-indigo-700">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center px-3 py-3 mb-2 border-b border-indigo-500/30">
                  <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center text-indigo-100 font-bold border border-indigo-400">
                        {getUserInitials(user?.name)}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">{user?.name}</div>
                    <div className="text-sm font-medium leading-none text-indigo-300 mt-1">{user?.role}</div>
                  </div>
                </div>

                <Link
                  to="/"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath('/')
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  Pets
                </Link>
                <Link
                  to="/tutores"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath('/tutores')
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  Tutores
                </Link>
                 <Link
                  to="/status"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath('/status')
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  Status
                </Link>
                
                <div className="border-t border-indigo-500/30 mt-4 pt-4 pb-2">
                    <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-red-500/80 hover:text-white transition-colors"
                    >
                    <LogOut className="mr-3 h-5 w-5" />
                    {isLoggingOut ? 'Saindo...' : 'Sair'}
                    </button>
                </div>
              </>
            ) : (
                <div className="p-3">
                     <button
                        onClick={handleLogin}
                        className="w-full bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm"
                    >
                        <UserIcon className="w-5 h-5" />
                        <span>Entrar</span>
                    </button>
                </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
