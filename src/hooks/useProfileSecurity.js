import { useEffect, useState } from 'react';
import {
  fetchDevices,
  fetchMFAPreference,
  forgetDevice,
  setUpTOTP,
  signOut,
  updateMFAPreference,
  verifyTOTPSetup
} from 'aws-amplify/auth';

const PROFILE_SETUP_STEPS = {
  IDLE: 'idle',
  QR: 'qr'
};

export default function useProfileSecurity() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [setupStep, setSetupStep] = useState(PROFILE_SETUP_STEPS.IDLE);
  const [qrUri, setQrUri] = useState('');
  const [verifyCode, setVerifyCode] = useState(['', '', '', '', '', '']);

  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);

  const loadProfileData = async () => {
    setLoading(true);
    setDevicesLoading(true);
    try {
      const mfaPreference = await fetchMFAPreference();
      const isEnabled = mfaPreference?.preferred === 'TOTP' || mfaPreference?.enabled?.includes('TOTP');
      setMfaEnabled(!!isEnabled);

      const userDevices = await fetchDevices();
      setDevices(userDevices);
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
      setDevicesLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleEnableMFA = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const totpSetup = await setUpTOTP();
      const appName = 'MyReactApp';
      setQrUri(totpSetup.getSetupUri(appName).toString());
      setSetupStep(PROFILE_SETUP_STEPS.QR);
    } catch (err) {
      setError('Error iniciando configuración MFA: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    setActionLoading(true);
    setError('');
    try {
      const code = verifyCode.join('');
      await verifyTOTPSetup({ code });
      await updateMFAPreference({ totp: 'PREFERRED' });
      setMfaEnabled(true);
      setSetupStep(PROFILE_SETUP_STEPS.IDLE);
      setSuccess('¡MFA habilitado correctamente! Tu cuenta ahora tiene doble protección. 🛡️');
    } catch (err) {
      setError('Código inválido: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateMFAPreference({ totp: 'DISABLED' });
      setMfaEnabled(false);
      setSuccess('MFA deshabilitado correctamente.');
    } catch (err) {
      setError('Error deshabilitando MFA: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleForgetDevice = async (device = null) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      if (device) {
        await forgetDevice({ device });
        setSuccess('Dispositivo desvinculado exitosamente.');
      } else {
        await forgetDevice();
        setSuccess('El dispositivo actual ha sido olvidado.');
      }

      const userDevices = await fetchDevices();
      setDevices(userDevices);
    } catch (err) {
      setError('Error olvidando dispositivo: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGlobalSignOut = async () => {
    if (!window.confirm('¿Estás seguro que deseas cerrar sesión en TODOS tus dispositivos? Esto te sacará inmediatamente de esta computadora también.')) {
      return;
    }

    setActionLoading(true);
    try {
      try {
        await forgetDevice();
      } catch (err) {
        console.warn('No se pudo olvidar el dispositivo local:', err);
      }

      localStorage.clear();
      await signOut({ global: true });
    } catch (err) {
      setError('Error al revocar todas las sesiones: ' + err.message);
      setActionLoading(false);
    }
  };

  return {
    PROFILE_SETUP_STEPS,
    mfaEnabled,
    loading,
    actionLoading,
    error,
    success,
    setupStep,
    setSetupStep,
    qrUri,
    verifyCode,
    setVerifyCode,
    devices,
    devicesLoading,
    setError,
    handleEnableMFA,
    handleVerifyTOTP,
    handleDisableMFA,
    handleForgetDevice,
    handleGlobalSignOut
  };
}
