import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  ShieldCheck,
  Shield,
  UserPlus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export default function StaffPage() {
  const { user: currentUser } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [gateName, setGateName] = useState('Main Gate 1');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/staff');
      setStaffList(res.data || []);
    } catch (e) {
      console.error('Failed to load staff list', e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setUsername('');
    setGateName('Main Gate 1');
    setError('');
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users/admin', {
        fullName,
        phone,
        email,
        username,
        role: 'ROLE_ADMIN'
      });
      setSuccess('Admin account created successfully with default password Abc@123');
      setShowAdminModal(false);
      resetForm();
      loadStaff();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create admin');
    }
  };

  const handleCreateSecurity = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users/security', {
        fullName,
        phone,
        gateName,
        role: 'ROLE_SECURITY'
      });
      setSuccess('Security guard created successfully! Guard can log in using Mobile with password Abc@123');
      setShowSecurityModal(false);
      resetForm();
      loadStaff();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create security guard');
    }
  };

  const handleDeleteStaff = async (staff) => {
    if (staff.id === currentUser?.userId) {
      alert('You cannot delete your own active administrator account!');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user ${staff.fullName || staff.username}?`)) {
      return;
    }

    try {
      await api.delete(`/users/${staff.id}`);
      loadStaff();
    } catch (err) {
      alert('Failed to delete staff: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Gate Security Team"
        subtitle="Manage access roles for administrative operators and security personnel stationed at premises gates."
        badge={`${staffList.length} Accounts`}
        badgeIcon={ShieldCheck}
        breadcrumbs={[{ label: 'Staff & Security' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { resetForm(); setShowSecurityModal(true); }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-ocean-cyan hover:bg-ocean-cyanHover text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Shield className="w-4 h-4" />
              <span>+ Add Security Guard</span>
            </button>
            <button
              onClick={() => { resetForm(); setShowAdminModal(true); }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-surface-secondary text-content-primary hover:bg-line-subtle border border-line-subtle rounded-xl text-xs font-bold transition shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-ocean-cyan" />
              <span>+ Add Co-Admin</span>
            </button>
          </div>
        }
      />

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl font-medium flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Staff Table */}
      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : staffList.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Staff Accounts Found"
          description="Provision a gatekeeper or administrator account using the buttons above."
        />
      ) : (
        <div className="bg-surface-main rounded-3xl border border-line-subtle shadow-saas-card overflow-hidden">
          <div className="table-container">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line-subtle text-content-muted uppercase font-bold text-[10px] bg-surface-secondary/40">
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">System Role</th>
                  <th className="py-3.5 px-4">Login Identifier</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-secondary/50 transition">
                    <td className="py-3.5 px-4 font-bold text-content-primary">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-deep to-ocean-cyan text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {s.fullName ? s.fullName.charAt(0) : 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-content-primary">{s.fullName}</p>
                          <span className="text-[10px] text-content-muted">ID: #{s.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.role} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-content-secondary">
                      {s.username}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-content-primary">
                      {s.phone}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {s.id !== currentUser?.userId && (
                        <button
                          onClick={() => handleDeleteStaff(s)}
                          className="p-1.5 rounded-lg text-content-muted hover:text-red-500 hover:bg-red-500/10 transition"
                          title="Revoke access & delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Security Guard Modal */}
      <Modal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        title="Register Security Guard"
        subtitle="Guard will log in using their mobile number and default password Abc@123"
        icon={Shield}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSecurity} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 text-red-600 text-xs rounded-xl">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase mb-1">Guard Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Babu Gatekeeper"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase mb-1">Mobile Number (Login ID)</label>
            <input
              type="text"
              required
              placeholder="+91 9777111222"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase mb-1">Gate Station Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Main Gate 1, East Gate"
              value={gateName}
              onChange={(e) => setGateName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowSecurityModal(false)}
              className="px-4 py-2 text-xs font-semibold text-content-secondary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-ocean-cyan hover:bg-ocean-cyanHover rounded-xl shadow-xs"
            >
              Create Guard Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Admin Modal */}
      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="Add Co-Administrator"
        subtitle="Grant full executive access to residential operations"
        icon={ShieldCheck}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 text-red-600 text-xs rounded-xl">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase mb-1">Admin Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Manager Shammaz"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase mb-1">Username / Login ID</label>
            <input
              type="text"
              required
              placeholder="e.g. admin2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase mb-1">Mobile Number</label>
            <input
              type="text"
              required
              placeholder="+91 9633119765"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase mb-1">Email</label>
            <input
              type="email"
              placeholder="admin@snns.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAdminModal(false)}
              className="px-4 py-2 text-xs font-semibold text-content-secondary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-ocean-cyan hover:bg-ocean-cyanHover rounded-xl shadow-xs"
            >
              Provision Admin Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
