import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  UserPlus,
  Users,
  FileText,
  Phone,
  Mail,
  Trash2,
  ExternalLink,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  Search,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
      setTenants(tenantsRes.data || []);
      setRooms(roomsRes.data || []);
      const vacant = (roomsRes.data || []).filter(r => r.status === 'VACANT');
      if (vacant.length > 0) {
        setRoomId(vacant[0].id);
      } else if (roomsRes.data?.length > 0) {
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
    } catch (err) {
      setOnboardError(err.response?.data?.message || err.message || 'Failed to onboard tenant');
    }
  };

  const handleDeboard = async (tenant) => {
    setDeboardError('');
    if (!window.confirm(`Are you sure you want to deboard ${tenant.fullName} from Room ${tenant.room?.roomNumber}?`)) {
      return;
    }

    try {
      await api.delete(`/tenants/${tenant.id}/deboard`);
      alert(`Tenant ${tenant.fullName} deboarded. Room ${tenant.room?.roomNumber} is now marked VACANT.`);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to deboard tenant';
      setDeboardError(msg);
      alert(msg);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.fullName?.toLowerCase().includes(q) ||
      t.phone?.includes(q) ||
      t.room?.roomNumber?.toLowerCase().includes(q) ||
      t.aadhaarNumber?.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resident & Tenant Management"
        subtitle="Onboard new tenants, manage digital KYC profiles, and handle lease transitions."
        badge={`${tenants.length} Active Tenants`}
        badgeIcon={Users}
        breadcrumbs={[{ label: 'Tenants & KYC' }]}
        actions={
          <button
            onClick={() => { setOnboardError(''); setShowOnboardModal(true); }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-ocean-cyan hover:bg-ocean-cyanHover text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Onboard New Tenant</span>
          </button>
        }
      />

      {/* Deboard Error Alert */}
      {deboardError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs rounded-2xl font-medium flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{deboardError}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-surface-main p-3 rounded-2xl border border-line-subtle shadow-saas-card">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by resident name, flat number, phone, or Aadhaar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-surface-secondary text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
          />
        </div>
        <span className="text-xs text-content-muted font-medium pr-2">
          Showing {filteredTenants.length} residents
        </span>
      </div>

      {/* Tenants Table or Empty State */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : filteredTenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Active Tenants Found"
          description="Click the '+ Onboard New Tenant' button above to assign a resident to an available vacant flat."
        />
      ) : (
        <div className="bg-surface-main rounded-3xl border border-line-subtle shadow-saas-card overflow-hidden">
          <div className="table-container">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line-subtle text-content-muted uppercase font-bold text-[10px] bg-surface-secondary/40">
                  <th className="py-3.5 px-4">Flat #</th>
                  <th className="py-3.5 px-4">Resident Name</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">KYC / Aadhaar</th>
                  <th className="py-3.5 px-4">Lease & Members</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-secondary/50 transition">
                    <td className="py-3.5 px-4 font-extrabold text-content-primary">
                      <span className="px-2.5 py-1 rounded-lg bg-ocean-cyan/10 text-ocean-cyan border border-ocean-cyan/30 text-xs font-mono">
                        Flat {t.room?.roomNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-deep to-ocean-violet text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {t.fullName ? t.fullName.charAt(0) : 'R'}
                        </div>
                        <div>
                          <p className="font-bold text-content-primary text-sm">{t.fullName}</p>
                          <span className="text-[10px] text-content-muted font-mono">ID: #{t.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5 text-content-secondary">
                      <p className="flex items-center space-x-1.5 font-medium">
                        <Phone className="w-3 h-3 text-ocean-cyan shrink-0" />
                        <span>{t.phone}</span>
                      </p>
                      {t.email && (
                        <p className="flex items-center space-x-1.5 text-content-muted text-[11px]">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>{t.email}</span>
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <p className="font-mono text-content-primary font-medium text-xs">
                        {t.aadhaarNumber || 'Not Provided'}
                      </p>
                      <div className="flex items-center space-x-2">
                        {t.aadhaarDocPath && (
                          <a
                            href={`/api/files/${t.aadhaarDocPath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-[11px] text-ocean-cyan hover:underline"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Aadhaar Doc</span>
                          </a>
                        )}
                        {t.photoPath && (
                          <a
                            href={`/api/files/${t.photoPath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-[11px] text-ocean-violet hover:underline"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Photo</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5 text-content-secondary">
                      <p className="font-semibold text-content-primary">
                        {t.memberCount || 1} Member(s)
                      </p>
                      {t.memberDetails && (
                        <p className="text-[11px] text-content-muted truncate max-w-[180px]">
                          {t.memberDetails}
                        </p>
                      )}
                      <p className="text-[10px] text-content-muted">
                        Lease: {t.leaseStartDate ? new Date(t.leaseStartDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeboard(t)}
                        className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold transition flex items-center space-x-1 ml-auto"
                        title="Deboard resident and vacate unit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Deboard</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onboard Tenant Modal */}
      <Modal
        isOpen={showOnboardModal}
        onClose={() => setShowOnboardModal(false)}
        title="Onboard Resident Tenant"
        subtitle="Provision digital resident account & capture KYC files"
        icon={UserPlus}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleOnboard} className="space-y-4">
          {onboardError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 text-xs rounded-xl font-medium">
              {onboardError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
                Assign Flat
              </label>
              <select
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Flat {r.roomNumber} ({r.status}) - Floor {r.floorNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Varma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
                Phone Number (Primary Login)
              </label>
              <input
                type="text"
                required
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="resident@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
                Aadhaar Number
              </label>
              <input
                type="text"
                placeholder="1234-5678-9012"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
                Family / Member Count
              </label>
              <input
                type="number"
                min="1"
                required
                value={memberCount}
                onChange={(e) => setMemberCount(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
              Member Names / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Spouse (Anju), Child (Aarav)"
              value={memberDetails}
              onChange={(e) => setMemberDetails(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
            />
          </div>

          {/* KYC File Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-surface-secondary/70 border border-line-subtle">
            <div>
              <label className="block text-[11px] font-bold text-content-primary uppercase tracking-wider mb-1">
                Aadhaar Document (.pdf or image)
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setAadhaarFile(e.target.files[0])}
                className="text-xs text-content-secondary file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-ocean-cyan/10 file:text-ocean-cyan hover:file:bg-ocean-cyan/20 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-content-primary uppercase tracking-wider mb-1">
                Resident Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files[0])}
                className="text-xs text-content-secondary file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-ocean-violet/10 file:text-ocean-violet hover:file:bg-ocean-violet/20 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setShowOnboardModal(false)}
              className="px-4 py-2.5 text-xs font-semibold text-content-secondary hover:text-content-primary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-ocean-cyan hover:bg-ocean-cyanHover rounded-xl shadow-xs"
            >
              Confirm & Onboard Tenant
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
