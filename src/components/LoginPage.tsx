import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onBackToLanding: () => void;
  onGoToSignup: () => void;
}

export function LoginPage({ onLogin, onBackToLanding, onGoToSignup }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-3 mb-6 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" x2="12" y1="2" y2="22"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <span className="text-slate-900 group-hover:text-purple-600 transition-colors">
              Pró-Quitação
            </span>
          </button>
          <h1 className="text-slate-900 mb-2">Bem-vindo de volta</h1>
          <p className="text-slate-600">Entre na sua conta para continuar</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-slate-600">Lembrar de mim</span>
              </label>
              <button
                type="button"
                className="text-purple-600 hover:text-purple-700 transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg transition-all">
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Não tem conta?{' '}
              <button
                onClick={onGoToSignup}
                className="text-purple-600 hover:text-purple-700 transition-colors"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center text-slate-500">
          <p>Sua segurança é nossa prioridade 🔒</p>
        </div>
      </div>
    </div>
  );
}
