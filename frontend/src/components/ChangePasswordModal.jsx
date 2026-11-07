import React, { useState } from 'react';
import api from '../api/client';
import { Lock, X, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import Modal from './common/Modal';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      setSuccess('Password updated successfully! Please use your new password next time.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Account Password"
      subtitle="Update your security credentials"
      icon={KeyRound}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-content-secondary leading-relaxed bg-surface-secondary/60 p-3 rounded-xl border border-line-subtle">
          Initial default password is <span className="font-mono font-bold text-ocean-cyan">Abc@123</span>. Choose a strong combination of letters and numbers.
        </p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl font-medium flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
            Current Password
          </label>
          <input
            type="password"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full px-3.5 py-2.5 text-sm bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:border-ocean-cyan focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full px-3.5 py-2.5 text-sm bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:border-ocean-cyan focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full px-3.5 py-2.5 text-sm bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:border-ocean-cyan focus:outline-none transition"
          />
        </div>

        <div className="pt-3 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-semibold text-content-secondary hover:text-content-primary hover:bg-surface-secondary rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-ocean-cyan hover:bg-ocean-cyanHover rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
