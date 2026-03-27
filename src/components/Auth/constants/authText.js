export const LOGIN_UI = {
  title: 'Welcome Back',
  subtitle: 'Enter your credentials to access your account',
  setupTotpTitle: 'Configura tu MFA',
  confirmEmailOtpTitle: 'Revisa tu correo',
  confirmTotpTitle: 'Autenticación en 2 Pasos',
  setupTotpDescription: 'Escanea este QR con Google Authenticator o Authy, y digita el código de 6 números que se genera.',
  confirmEmailOtpDescription: (email) => `Te acabamos de enviar un código temporal a ${email}. Cópialo aquí para ingresar.`,
  confirmTotpDescription: 'Ingresa el código de 6 dígitos que aparece en tu aplicación de autenticación dinámica.',
  verifyAndEnter: 'Verificar e Ingresar',
  cancel: 'Cancelar',
  switchToPassword: 'Iniciar sesión con contraseña en su lugar',
  emailLabel: 'Email',
  emailPlaceholder: 'you@email.com',
  rememberOtp: 'Recordar este equipo (No pedirá códigos a futuro)',
  continue: 'Continuar',
  passwordLabel: 'Contraseña',
  forgotPassword: '¿La olvidaste?',
  passwordPlaceholder: '••••••••',
  rememberPassword: 'Recordar este equipo (No pedirá MFA a futuro)',
  enter: 'Ingresar',
  switchToPasswordless: 'Ingresar sin contraseña en su lugar',
  divider: 'or continue with',
  googleSignIn: 'Sign in with Google',
  noAccount: "Don't have an account?",
  signUp: 'Sign up'
};

export const LOGIN_FLOW_TEXT = {
  appName: 'MyReactApp',
  emailRequired: 'Por favor, ingresa tu correo electrónico primero.',
  passwordRequired: 'Por favor, ingresa tu contraseña.',
  emailCodeUnexpectedForPassword: 'Login con contraseña no debería pedir código por correo. Revisa en Cognito que no tengas MFA por email activo para este usuario.',
  missingPasswordFactor: 'Tu pool no ofrece factor de contraseña en este flujo.',
  emailOtpDisabled: 'El inicio por correo está deshabilitado para esta cuenta. Usa contraseña.',
  factorSelectionError: (message) => `Error seleccionando factor: ${message}`,
  mfaSelectionError: (message) => `Error seleccionando MFA: ${message}`,
  unsupportedChallenge: (step) => `Reto no validado en UI: ${step}`,
  signInError: 'Error al iniciar sesión',
  remainingStep: (step) => `Aún falta un paso: ${step}`,
  invalidMfaCode: 'Código MFA inválido',
  emailOtpRetryError: 'No se pudo verificar el código de correo tras limpiar el dispositivo local.'
};

export const REGISTER_UI = {
  verifyEmailTitle: 'Verifica tu correo',
  verifyEmailPrefix: 'Hemos enviado un código a',
  verifyEmailSuffix: 'Ingrésalo a continuación para confirmar tu cuenta.',
  confirmAccount: 'Confirmar Cuenta',
  backToLogin: 'Volver a',
  login: 'Iniciar sesión',
  title: 'Create an Account',
  subtitle: 'Join us and start your journey',
  fullNameLabel: 'Full Name',
  fullNamePlaceholder: 'John Doe',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  passwordLabel: 'Password',
  passwordPlaceholder: '••••••••',
  signUp: 'Sign Up',
  haveAccount: 'Already have an account?',
  signIn: 'Sign in'
};

export const REGISTER_ERRORS = {
  signUpError: 'Error al registrar usuario',
  invalidCode: 'Código inválido'
};
