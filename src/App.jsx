import React, { useState, useEffect } from 'react';
import { getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';
import { Moon, Sun, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [page, setPage] = useState('dashboard'); // 'dashboard' | 'profile'
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const detectGoogleOrigin = (currentUser, session) => {
    const username = String(currentUser?.username || '').toLowerCase();
    const payload = session?.tokens?.idToken?.payload || {};
    const cognitoUsername = String(payload?.['cognito:username'] || '').toLowerCase();
    const identityProvider = String(payload?.identities?.[0]?.providerName || payload?.identities?.[0]?.provider || '').toLowerCase();

    return (
      username.startsWith('google_') ||
      cognitoUsername.startsWith('google_') ||
      identityProvider.includes('google')
    );
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      setUser(currentUser);
      setIsGoogleUser(detectGoogleOrigin(currentUser, session));
    } catch {
      setUser(null);
      setIsGoogleUser(false);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    checkUser();
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          setUser(null);
          setIsGoogleUser(false);
          setPage('dashboard');
          break;
      }
    });
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setIsGoogleUser(false);
      setPage('dashboard');
    } catch (err) {
      console.error('Error signing out: ', err);
    }
  };

  if (loadingConfig) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderAuthenticatedContent = () => {
    if (page === 'profile') {
      return <Profile onBack={() => setPage('dashboard')} isGoogleUser={isGoogleUser} />;
    }

    return (
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
                Dashboard
              </h2>
              <p className="text-gray-500 dark:text-gray-400">¡Sesión iniciada exitosamente!</p>
            </div>
          </div>

          <div className="p-6 bg-white/50 dark:bg-black/20 rounded-2xl border border-gray-200 dark:border-gray-800 mb-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Usuario Autenticado:</p>
            <p className="text-lg text-gray-900 dark:text-white font-mono break-all bg-gray-100 dark:bg-gray-900 p-4 rounded-xl">
              {user.username}
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Amplify se encarga de guardar y refrescar tus JWT Tokens automáticamente.
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setPage('profile')}
              className="flex-1 py-3 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-5 h-5" />
              Seguridad (MFA)
            </button>

            <button 
              onClick={handleSignOut}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 transition-colors duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/30 dark:bg-blue-900/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/30 dark:bg-indigo-900/40 blur-[100px] pointer-events-none" />
      
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full z-50 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:scale-110 active:scale-95 transition-all shadow-sm"
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      <div className="z-10 w-full flex justify-center mt-12 mb-12">
        {user ? (
          renderAuthenticatedContent()
        ) : (
          view === 'login' ? (
            <Login 
              onNavigate={() => setView('register')} 
              onLoginSuccess={() => checkUser()} 
            />
          ) : (
            <Register 
              onNavigate={() => setView('login')} 
            />
          )
        )}
      </div>
      
      <div className="absolute bottom-6 text-center text-xs text-gray-500 dark:text-gray-500">
        Demo UI for AWS Cognito Frontend Integration
      </div>
    </div>
  );
}
