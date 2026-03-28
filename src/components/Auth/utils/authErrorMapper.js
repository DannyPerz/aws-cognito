const COGNITO_ERROR_MESSAGES = {
  UserNotFoundException: 'No encontramos una cuenta con ese correo.',
  NotAuthorizedException: 'Correo o contraseña incorrectos.',
  UserNotConfirmedException: 'Tu cuenta aun no esta confirmada. Revisa tu correo.',
  UsernameExistsException: 'Este correo ya esta registrado.',
  CodeMismatchException: 'El codigo ingresado no es valido.',
  ExpiredCodeException: 'El codigo expiro. Solicita uno nuevo.',
  LimitExceededException: 'Se excedio el numero de intentos. Intenta nuevamente mas tarde.',
  TooManyRequestsException: 'Demasiados intentos. Espera un momento e intenta de nuevo.',
  InvalidPasswordException: 'La contrasena no cumple los requisitos de seguridad.'
};

const OAUTH_ERROR_MESSAGES = {
  access_denied: 'Cancelaste el inicio de sesion con Google.',
  invalid_request: 'La solicitud de inicio con Google no es valida.',
  server_error: 'Google no pudo completar el inicio de sesion. Intenta nuevamente.',
  temporarily_unavailable: 'Google no esta disponible en este momento. Intenta nuevamente.'
};

const stripTechnicalPrefix = (message) => {
  if (!message || typeof message !== 'string') return message;

  const cleaned = message
    .trim()
    .replace(/^[A-Za-z0-9_]+\s+failed\s+with\s+error\s*/i, '')
    .replace(/^Error:\s*/i, '')
    .replace(/^[\s:.-]+/, '');

  return cleaned || message;
};

const getRawMessage = (error) => {
  if (!error) return '';
  if (typeof error === 'string') return error;
  return error.message || '';
};

export const mapAuthError = (error, fallbackMessage = 'Ocurrio un error inesperado.') => {
  if (!error) return fallbackMessage;

  const code = error?.name || error?.code;
  if (code && COGNITO_ERROR_MESSAGES[code]) {
    return COGNITO_ERROR_MESSAGES[code];
  }

  const rawMessage = getRawMessage(error);
  if (!rawMessage) return fallbackMessage;

  return stripTechnicalPrefix(rawMessage);
};

export const mapOAuthError = ({ code, description }) => {
  if (description) {
    return stripTechnicalPrefix(description);
  }

  if (code && OAUTH_ERROR_MESSAGES[code]) {
    return OAUTH_ERROR_MESSAGES[code];
  }

  return 'Error en autenticacion con Google.';
};
