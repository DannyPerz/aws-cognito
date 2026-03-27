import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { signUp, confirmSignUp, signIn } from 'aws-amplify/auth';
import CodeInputGroup from './CodeInputGroup';
import AuthPanel from './ui/AuthPanel';
import AuthErrorMessage from './ui/AuthErrorMessage';
import AuthTextField from './ui/AuthTextField';

export default function Register({ onNavigate }) {
  const [step, setStep] = useState('register'); // register or confirm
  
  // Register state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Confirm state
  const [code, setCode] = useState(['', '', '', '', '', '']);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name
          }
        }
      });
      setStep('confirm');
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const confirmationCode = code.join('');
      await confirmSignUp({ username: email, confirmationCode });
      
      // Intentamos hacer auto-login ya que ahora el MFA es opcional
      try {
        const { isSignedIn } = await signIn({ username: email, password });
        if (!isSignedIn) {
          // Si por alguna razón pide un reto (MFA u otro), 
          // lo mandamos al Login para que esa pantalla maneje el flujo complejo.
          onNavigate();
        }
        // Si isSignedIn es true, el Hub en App.jsx detectará el evento 'signedIn' 
        // y lo enviará automáticamente al Dashboard.
      } catch {
        // Si el auto-login falla, también lo mandamos al Login por precaución.
        onNavigate();
      }
      
    } catch (err) {
      setError(err.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirm') {
    return (
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <AuthPanel className="bg-white/10 dark:bg-black/40 border-white/20 dark:border-white/10 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verifica tu correo
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
            Hemos enviado un código a <strong>{email}</strong>. Ingrésalo a continuación para confirmar tu cuenta.
          </p>

          <AuthErrorMessage message={error} className="text-left" />
          
          <form className="space-y-4" onSubmit={handleConfirm}>
            <CodeInputGroup
              value={code}
              onChange={setCode}
              length={6}
              idPrefix="code"
              inputClassName="w-12 h-14 text-center text-xl font-bold bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            />

            <button 
              disabled={loading || code.some(c => c === '')}
              className="w-full py-3 mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirmar Cuenta'}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Volver a <button onClick={onNavigate} className="text-blue-600 hover:underline">Iniciar sesión</button>
          </p>
        </AuthPanel>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AuthPanel className="bg-white/10 dark:bg-black/40 border-white/20 dark:border-white/10">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            Create an Account
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Join us and start your journey
          </p>
        </div>

        <AuthErrorMessage message={error} />

        <form className="space-y-4" onSubmit={handleSignUp}>
          <AuthTextField
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            icon={User}
            inputClassName="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
          />

          <AuthTextField
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={Mail}
            inputClassName="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
          />

          <AuthTextField
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            inputClassName="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
          />

          <button 
            disabled={loading}
            className="w-full py-3 mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white rounded-xl font-medium flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign Up'}
            {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button onClick={onNavigate} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Sign in
          </button>
        </p>
      </AuthPanel>
    </div>
  );
}
