import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, KeyRound, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const { loginUser, updateUserPassword, currentUser } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forced Password Change Modal State (Section 9)
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Invalid credentials. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginUser(username, password);
      setIsSubmitting(false);

      if (res.success) {
        if (res.requirePasswordChange) {
          setRequirePasswordChange(true);
        } else {
          onLoginSuccess();
          onClose();
        }
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please try again.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Authentication error. Please try again.');
    }
  };

  const handleForcePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);

    if (newPassword.length < 10) {
      setPasswordChangeError('Password must be at least 10 characters in length.');
      return;
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNum = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNum || !hasSpecial) {
      setPasswordChangeError('Must contain uppercase, lowercase, number, and special character.');
      return;
    }

    if (newPassword === 'Admin@2026') {
      setPasswordChangeError('Cannot reuse the temporary default password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('Passwords do not match.');
      return;
    }

    if (currentUser) {
      setIsSubmitting(true);
      await updateUserPassword(currentUser.id, newPassword);
      setIsSubmitting(false);
      setRequirePasswordChange(false);
      onLoginSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Disguised Header with Shield Logo per Section 8.1 & 8.3 */}
        <div className="bg-[#1a2a4a] text-white p-5 flex items-center justify-between border-b-2 border-[#c9a227]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0f1a30] border border-[#c9a227] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#c9a227]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base tracking-wide">
                Secure Chambers Access
              </h2>
              <p className="text-[10px] text-[#c9a227] tracking-wider uppercase font-mono-code">
                B. B. BALE & CO INTERNAL SYSTEM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 bg-[#f8f6f1]">
          {requirePasswordChange ? (
            /* Forced Password Change Form (Section 9.3) */
            <form onSubmit={handleForcePasswordChange} className="space-y-4">
              <div className="text-center space-y-1">
                <KeyRound className="w-8 h-8 text-[#c9a227] mx-auto" />
                <h3 className="font-serif font-bold text-sm text-[#1a2a4a]">
                  Mandatory First-Login Password Change
                </h3>
                <p className="text-[11px] text-gray-600">
                  Default credentials detected. Firm policy requires establishing a secure personal password before system access.
                </p>
              </div>

              {passwordChangeError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordChangeError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">New Secure Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                />
                <div className="text-[10px] text-gray-500 mt-1">
                  10+ characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-bold text-xs rounded shadow transition-all font-serif-heading"
              >
                Set Password & Proceed to Chambers
              </button>
            </form>
          ) : (
            /* Secure Sign In Form - Strict Section 8.2: NO HINTS */
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMessage && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs p-2.5 pr-9 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Disguised Login Button with Shield Logo per Section 8.3 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#1a2a4a] text-white hover:bg-[#111e38] font-bold text-xs rounded shadow-md border border-[#c9a227] transition-all flex items-center justify-center gap-2 cursor-pointer font-serif-heading"
              >
                <Shield className="w-4 h-4 text-[#c9a227]" />
                <span>{isSubmitting ? 'Authenticating...' : 'SIGN IN'}</span>
              </button>

              <div className="pt-2 text-center text-[11px] text-gray-500">
                <span>Authorized legal personnel and staff of B. B. BALE & CO only.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
