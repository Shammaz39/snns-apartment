import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { UserPlus, Users, FileText, Phone, Mail, Trash2, ExternalLink, AlertCircle, KeyRound, ShieldAlert } from 'lucide-react';

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deboardError, setDeboardError] = useState('');

  // Form state
  const [roomId, setRoomId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [memberCount, setMemberCount] = useState(1);
  const [memberDetails, setMemberDetails] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [onboardError, setOnboardError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantsRes, roomsRes] = await Promise.all([
        api.get('/tenants'),
        api.get('/rooms')
      ]);
      setTenants(tenantsRes.data);
      setRooms(roomsRes.data);
      const vacant = roomsRes.data.filter(r => r.status === 'VACANT');
      if (vacant.length > 0) {
        setRoomId(vacant[0].id);
      } else if (roomsRes.data.length > 0) {
        setRoomId(roomsRes.data[0].id);
      }
    } catch (e) {
      console.error('Failed to load tenants', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    setOnboardError('');
    try {
      const formData = new FormData();
      formData.append('roomId', roomId);
      formData.append('fullName', fullName);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('aadhaarNumber', aadhaarNumber);
      formData.append('memberCount', memberCount);
      formData.append('memberDetails', memberDetails);
      if (leaseStart) formData.append('leaseStartDate', leaseStart);
      if (leaseEnd) formData.append('leaseEndDate', leaseEnd);
      if (aadhaarFile) formData.append('aadhaarDoc', aadhaarFile);
      if (photoFile) formData.append('photo', photoFile);

      await api.post('/tenants/onboard', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Tenant successfully onboarded! Resident can log in using their Room Number or Mobile with initial password: Abc@123');
      setShowOnboardModal(false);
      // Reset
      setFullName('');
      setPhone('');
      setEmail('');
      setAadhaarNumber('');
      setMemberDetails('');
      setAadhaarFile(null);
      setPhotoFile(null);
      loadData();
    } catch (e) {
      setOnboardError(e.response?.data?.message || e.message || 'Failed to onboard tenant');
    }
  };

  const handleDeboard = async (tenant) => {
    setDeboardError('');
    if (!window.confirm(`Are you sure you want to deboard ${tenant.fullName} from Room ${tenant.room?.roomNumber}?`)) {
      return;
    }
    try {
      await api.delete(`/tenants/${tenant.id}/deboard`);
      loadData();
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      setDeboardError(errMsg);
      alert('Deboard Blocked:\n' + errMsg);
    }
  };

  const vacantRooms = rooms.filter(r => r.status === 'VACANT');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-6 h-6 text-brand-600" />
            <span>Tenant KYC & Resident Directory</span>
          </h2>
          <p className="text-sm text-slate-500">
            Registered residents, Aadhaar ID verification documents, and family count.
          </p>
        </div>

        <button
          onClick={() => { setOnboardError(''); setShowOnboardModal(true); }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Onboard New Resident</span>
        </button>
      </div>

      {deboardError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-medium flex items-center space-x-2 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <div className="font-bold">Deboard Action Blocked</div>
            <div>{deboardError}</div>
          </div>
        </div>
      )}

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Room</th>
                <th className="px-5 py-3.5">Resident Name</th>
                <th className="px-5 py-3.5">Contact (Login ID)</th>
                <th className="px-5 py-3.5">Aadhaar & KYC</th>
                <th className="px-5 py-3.5">Family Members</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">
                    No active tenants found. Click "+ Onboard New Resident" to add one.
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <span className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg border border-brand-200">
                        Room {t.room?.roomNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">{t.fullName}</div>
                      <div className="text-xs text-slate-400">Lease: {t.leaseStartDate || 'N/A'} to {t.leaseEndDate || 'N/A'}</div>
                    </td>
                    <td className="px-5 py-4 text-xs space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.phone}</span>
                      </div>
                      {t.email && (
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{t.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="font-mono text-slate-700 font-semibold">{t.aadhaarNumber}</div>
                      {t.aadhaarDocPath && (
                        <a
                          href={`/api/files/${t.aadhaarDocPath}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-brand-600 hover:text-brand-700 font-bold mt-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Doc</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="font-bold text-slate-800">{t.memberCount} Members</div>
                      <div className="text-slate-400 truncate max-w-xs">{t.memberDetails || 'No details'}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDeboard(t)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                      >
                        Deboard
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Tenant Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Onboard Resident with Aadhaar KYC</h3>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboard} className="p-6 overflow-y-auto space-y-4">
              {onboardError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{onboardError}</span>
                </div>
              )}

              <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900 flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  Resident can log in using their <strong>Room Number</strong> or <strong>Mobile Number</strong> with initial password: <code className="font-bold">Abc@123</code>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Vacant Room</label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  required
                >
                  {vacantRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room #{r.roomNumber} (Floor {r.floorNumber}) — Rent: ₹{r.defaultRent}
                    </option>
                  ))}
                  {vacantRooms.length === 0 && (
                    <option value="">No vacant rooms available! Add rooms first.</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile (Login ID)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenant@email.com"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Aadhaar Card Number</label>
                  <input
                    type="text"
                    required
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* KYC Document Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Aadhaar Document</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setAadhaarFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Passport Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lease Start Date</label>
                  <input
                    type="date"
                    value={leaseStart}
                    onChange={(e) => setLeaseStart(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lease End Date</label>
                  <input
                    type="date"
                    value={leaseEnd}
                    onChange={(e) => setLeaseEnd(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Family Members</label>
                  <input
                    type="number"
                    min="1"
                    value={memberCount}
                    onChange={(e) => setMemberCount(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Family Members Description</label>
                  <input
                    type="text"
                    value={memberDetails}
                    onChange={(e) => setMemberDetails(e.target.value)}
                    placeholder="e.g. Wife (Priya, 29), Child (Aarav, 4)"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={vacantRooms.length === 0}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  Confirm Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
