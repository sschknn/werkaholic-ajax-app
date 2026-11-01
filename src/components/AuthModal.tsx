import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AuthModal: React.FC = () => {
  const { login, register, loginWithGoogle, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">Anmeldung</h2>
        
        {showRegister ? (
          <div>
            <h3 className="text-white mb-4">Neues Konto erstellen</h3>
            <input
              placeholder="E-Mail"
              className="w-full p-3 border rounded mb-4"
              />
            <input
              placeholder="Passwort"
              type="password"
              className="w-full p-3 border rounded mb-4"
              />
            <button
              onClick={() => setShowRegister(false)}
              className="mt-4 w-full bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-xl font-bold"
            >
              Abbrechen
            </button>
            <button
              onClick={() => {
                // Registration logic would go here
                setShowRegister(false);
              }}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
            >
              Konto erstellen
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-white mb-4">Bereits ein Konto?</h3>
            <input
              placeholder="E-Mail"
              className="w-full p-3 border rounded mb-4"
              />
            <input
              placeholder="Passwort"
              type="password"
              className="w-full p-3 border rounded mb-4"
              />
            <button
              onClick={() => setShowRegister(true)}
              className="mt-4 w-full text-slate-400 underline cursor-pointer"
            >
              Neues Konto erstellen
            </button>
            <button
              onClick={() => handleLogin('test@test.com', 'password')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold mb-4"
            >
              Einloggen
            </button>
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold mb-4"
            >
              Mit Google einloggen
            </button>
            <button
              onClick={logout}
              className="w-full text-slate-400 text-sm underline cursor-pointer"
            >
              Abmelden
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
