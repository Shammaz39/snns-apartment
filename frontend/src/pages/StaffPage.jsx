import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { ShieldCheck, Shield, UserPlus, Trash2, AlertCircle, CheckCircle2, Phone, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
      setStaffList(res.data);
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
        email,
        username,
        gateName,
        role: 'ROLE_SECURITY'
      });
      setSuccess('Security guard created successfully. Guard can log in using their Phone Number or Name with default password Abc@123');
      setShowSecurityModal(false);
      resetForm();
      loadStaff();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create security guard');
    }
  };

  const handleDeleteStaff = async (staff) => {
    if (staff.username === currentUser?.username) {
      alert('You cannot delete your own logged-in account!');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${staff.fullName} (${staff.username})?`)) {
      return;
    }

    try {
      await api.delete(`/users/${staff.id}`);
      loadStaff();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete staff member');
    }
  };

  const admins = staffList.filter(s => s.role === 'ROLE_ADMIN');
  const security = staffList.filter(s => s.role === 'ROLE_SECURITY');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-brand-600" />
            <span>Staff, Admins & Security Management</span>
          </h2>
          <p className="text-sm text-slate-500">
            Create additional Property Admins and Gate Security Guards with auto-assigned credentials.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => { resetForm(); setShowAdminModal(true); }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-800 rounded-xl text-xs font-bold border border-brand-200 transition"
          >
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>+ Add Admin</span>
          </button>
          <button
            onClick={() => { resetForm(); setShowSecurityModal(true); }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Shield className="w-4 h-4 text-white" />
            <span>+ Add Security Guard</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Staff Sections */}
      <div className="space-y-6">
        {/* Admins Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-sm text-slate-800">Property Administrators ({admins.length})</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Full System Privileges</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-6">Name & Identifier</th>
                  <th className="py-3 px-6">Phone Number</th>
                  <th className="py-3 px-6">Email Address</th>
                  <th className="py-3 px-6">Default Password</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">{admin.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{admin.username}</div>
                    </td>
                    <td className="py-3.5 px-6">{admin.phone || '—'}</td>
                    <td className="py-3.5 px-6">{admin.email || '—'}</td>
                    <td className="py-3.5 px-6">
                      <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        Abc@123
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {admin.username !== currentUser?.username && (
                        <button
                          onClick={() => handleDeleteStaff(admin)}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="Delete Admin"
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

        {/* Security Guards Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-800">Gate Security Personnel ({security.length})</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Gate Pass & Visitor Logging</span>
          </div>

          {security.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Shield className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No security personnel registered yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click "+ Add Security Guard" to register gate guards.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-6">Guard Name</th>
                    <th className="py-3 px-6">Mobile (Login ID)</th>
                    <th className="py-3 px-6">Username</th>
                    <th className="py-3 px-6">Default Password</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                  {security.map((guard) => (
                    <tr key={guard.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-6 font-bold text-slate-900">{guard.fullName}</td>
                      <td className="py-3.5 px-6 font-semibold text-slate-700">{guard.phone}</td>
                      <td className="py-3.5 px-6 font-mono text-[11px] text-slate-400">{guard.username}</td>
                      <td className="py-3.5 px-6">
                        <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                          Abc@123
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleDeleteStaff(guard)}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="Delete Guard"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">+ Add Property Admin</h3>
              <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9888877777"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@snnsapartment.com"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Username (Optional)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Leave blank to auto-generate"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                Default password will be set to: <span className="font-mono font-bold text-brand-700">Abc@123</span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Security Guard Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">+ Add Security Guard</h3>
              <button onClick={() => setShowSecurityModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSecurity} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Guard Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Suresh Nair"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Guard Mobile Number (For Login)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9444555666"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Gate / Post
                </label>
                <input
                  type="text"
                  value={gateName}
                  onChange={(e) => setGateName(e.target.value)}
                  placeholder="e.g. Main Gate A"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                Guard can log in via <span className="font-semibold text-slate-800">Phone Number</span> or <span className="font-semibold text-slate-800">Name</span> with initial password: <span className="font-mono font-bold text-brand-700">Abc@123</span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
                >
                  Create Security Guard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
