import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { signUp, confirmSignUp, signIn } from 'aws-amplify/auth';

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

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1); // Only allow one char
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  if (step === 'confirm') {
    return (
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verifica tu correo
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
            Hemos enviado un código a <strong>{email}</strong>. Ingrésalo a continuación para confirmar tu cuenta.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100/50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleConfirm}>
            <div className="flex gap-2 justify-center">
              {code.map((digit, i) => (
                <input 
                  key={i}
                  id={`code-${i}`}
                  type="text" 
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  className="w-12 h-14 text-center text-xl font-bold bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
              ))}
            </div>

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
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            Create an Account
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Join us and start your journey
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100/50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSignUp}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="password"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

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
      </div>
    </div>
  );
}
