/**
 * Exemplo de Componente usando o Facade Pattern
 * Este arquivo serve como referência para criar novos componentes
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente de exemplo que demonstra:
 * 1. Uso do hook useAuth (que usa o Facade)
 * 2. Tailwind CSS para estilização
 * 3. TypeScript para tipagem
 * 4. Feedback visual de estados
 */
export const Example = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Facade simplifica: uma única chamada coordena tudo
      await login({ username, password });
      console.log('Login bem-sucedido!');
    } catch (err) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
      console.error('Erro no login:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUsername('');
      setPassword('');
      console.log('Logout bem-sucedido!');
    } catch (err) {
      console.error('Erro no logout:', err);
    }
  };

  // Se estiver autenticado, mostra perfil do usuário
  if (isAuthenticated && user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Bem-vindo!
        </h2>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Nome:</span>
            <span className="font-semibold">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-semibold">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">CPF:</span>
            <span className="font-semibold">{user.cpf}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Perfil:</span>
            <span className="font-semibold capitalize">{user.role}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saindo...' : 'Sair'}
        </button>
      </div>
    );
  }

  // Se não estiver autenticado, mostra formulário de login
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Login
      </h2>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Campo Username */}
        <div>
          <label 
            htmlFor="username" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="admin"
          />
        </div>

        {/* Campo Senha */}
        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Botão Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {/* Informação sobre o Facade */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Facade Pattern:</strong> Este componente usa o hook{' '}
          <code className="bg-blue-200 px-1 rounded">useAuth</code> que
          internamente utiliza o <code className="bg-blue-200 px-1 rounded">
          authFacade</code> para simplificar a interação com múltiplos
          subsistemas (AuthService + AuthStore + localStorage).
        </p>
      </div>
    </div>
  );
};
