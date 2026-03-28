import React from 'react';
import { Loader2 } from 'lucide-react';
import useProfileSecurity from '../../hooks/useProfileSecurity';
import MfaStatusCard from './ui/MfaStatusCard';
import DevicesCard from './ui/DevicesCard';
import DangerZoneCard from './ui/DangerZoneCard';
import ProfileFeedback from './ui/ProfileFeedback';
import ProfileHeader from './ui/ProfileHeader';

export default function Profile({ onBack, isGoogleUser = false }) {
  const {
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
  } = useProfileSecurity();

  if (loading && !devices.length) {
    return (
      <div className="w-full max-w-2xl flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <ProfileHeader onBack={onBack} />

      <ProfileFeedback error={error} success={success} />

      <MfaStatusCard
        isGoogleUser={isGoogleUser}
        mfaEnabled={mfaEnabled}
        setupStep={setupStep}
        setupSteps={PROFILE_SETUP_STEPS}
        qrUri={qrUri}
        verifyCode={verifyCode}
        setVerifyCode={setVerifyCode}
        actionLoading={actionLoading}
        onCancelSetup={() => {
          setSetupStep(PROFILE_SETUP_STEPS.IDLE);
          setError('');
        }}
        onVerifySetup={handleVerifyTOTP}
        onEnableMfa={handleEnableMFA}
        onDisableMfa={handleDisableMFA}
      />

      <DevicesCard
        devicesLoading={devicesLoading}
        devices={devices}
        actionLoading={actionLoading}
        onForgetDevice={handleForgetDevice}
      />

      <DangerZoneCard
        actionLoading={actionLoading}
        onGlobalSignOut={handleGlobalSignOut}
      />

    </div>
  );
}
