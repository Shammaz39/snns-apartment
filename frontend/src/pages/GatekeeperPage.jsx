import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Shield,
  UserCheck,
  LogOut,
  Clock,
  Car,
  DoorClosed,
  AlertCircle,
  CheckCircle2,
  History,
  Plus,
  Check,
  X,
  Users,
  Search,
  Calendar,
  BadgeCheck,
  FileText,
  Phone,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export default function GatekeeperPage() {
  const { user, isSecurity, isAdmin } = useAuth();
  const [activePasses, setActivePasses] = useState([]);
  const [allPasses, setAllPasses] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tab, setTab] = useState('ACTIVE'); // 'ACTIVE', 'PENDING', 'DIRECTORY', 'HISTORY'
  const [loading, setLoading] = useState(true);

  // Form states
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryMode, setEntryMode] = useState('CALL_CONFIRMED'); // 'CALL_CONFIRMED' or 'REQUEST_ENTRY'
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [purpose, setPurpose] = useState('GUEST');
  const [guardName, setGuardName] = useState(user?.fullName || 'Duty Guard');
  const [verificationNote, setVerificationNote] = useState('');
  const [searchDirectory, setSearchDirectory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update guard name when user loads
  useEffect(() => {
    if (user?.fullName) {
      setGuardName(user.fullName);
      setVerificationNote(`Confirmed with resident via phone call by Security Guard ${user.fullName}`);
    } else {
      setVerificationNote('Confirmed with resident via phone call by Security Guard');
    }
  }, [user]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000); // Live poll every 4s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [passesRes, roomsRes, dirRes] = await Promise.all([
        api.get('/visitor-passes'),
        api.get('/rooms'),
        api.get('/tenants/directory').catch(() => api.get('/rooms'))
      ]);

      const passes = passesRes.data || [];
      setAllPasses(passes);
      setActivePasses(passes.filter(p => p.status === 'CHECKED_IN'));

      const allR = roomsRes.data || [];
      setRooms(allR);
      setDirectory(dirRes.data || []);

      // Filter only OCCUPIED rooms for visitor destinations
      const occupied = allR.filter(r => r.status === 'OCCUPIED');
      if (occupied.length > 0 && (!roomNumber || !occupied.some(r => r.roomNumber === roomNumber))) {
        setRoomNumber(occupied[0].roomNumber);
      }
    } catch (e) {
      console.error('Failed to load visitor data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Ensure room is occupied
    const selectedRoom = rooms.find(r => r.roomNumber === roomNumber);
    if (!selectedRoom || selectedRoom.status !== 'OCCUPIED') {
      setError(`Cannot check in visitor for Room ${roomNumber}. Visitors can only visit occupied rooms!`);
      return;
    }

    try {
      const finalNote = verificationNote || `Confirmed with resident via phone call by Security Guard ${guardName}`;
      const payload = {
        visitorName,
        phone,
        vehicleNumber,
        roomId: selectedRoom.id,
        roomNumber,
        purpose,
        requestType: entryMode === 'CALL_CONFIRMED' ? 'SECURITY_CALL_CONFIRMED' : 'SECURITY_REQUEST',
        verifiedByGuard: guardName,
        verificationNotes: entryMode === 'CALL_CONFIRMED' ? finalNote : null
      };

      if (entryMode === 'CALL_CONFIRMED') {
        await api.post('/visitor-passes/call-confirmed', payload);
        setSuccess(`✅ Visitor ${visitorName} directly checked in! Audit note logged.`);
      } else {
        await api.post('/visitor-passes/request', payload);
        setSuccess(`🔔 Approval request sent to Resident of Room ${roomNumber}! Entry pending resident confirmation.`);
      }

      setShowEntryModal(false);
      setVisitorName('');
      setPhone('');
      setVehicleNumber('');
      loadData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process visitor entry');
    }
  };

  const handleCheckInApproved = async (passId, name) => {
    try {
      await api.put(`/visitor-passes/${passId}/check-in`);
      setSuccess(`✅ Visitor ${name} has been Checked-In!`);
      loadData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert('Failed to check in: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCheckOut = async (passId, name) => {
    try {
      await api.put(`/visitor-passes/${passId}/check-out`);
      setSuccess(`👋 Visitor ${name} successfully Checked-Out.`);
      loadData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert('Failed to check out: ' + (err.response?.data?.message || err.message));
    }
  };

  const pendingPasses = allPasses.filter(p => p.status === 'PENDING');
  const approvedPrePasses = allPasses.filter(p => p.status === 'APPROVED');
  const historyPasses = allPasses.filter(p => p.status === 'CHECKED_OUT' || p.status === 'REJECTED');
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED');

  const filteredDirectory = directory.filter((d) => {
    if (!searchDirectory) return true;
    const q = searchDirectory.toLowerCase();
    return (
      d.fullName?.toLowerCase().includes(q) ||
      d.phone?.includes(q) ||
      d.room?.roomNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gatekeeper Operations Terminal"
        subtitle="Live visitor check-in, real-time resident approval broadcasts, and premises audit tracking."
        badge={`${activePasses.length} Visitors Inside`}
        badgeIcon={Shield}
        breadcrumbs={[{ label: 'Gatekeeper Terminal' }]}
        actions={
          <button
            onClick={() => { setError(''); setShowEntryModal(true); }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-ocean-cyan hover:bg-ocean-cyanHover text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Gate Visitor Entry</span>
          </button>
        }
      />

      {/* Success Notification Banner */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl font-medium flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex bg-surface-main p-1.5 rounded-2xl border border-line-subtle shadow-saas-card overflow-x-auto text-xs font-bold max-w-fit gap-1">
        {[
          { key: 'ACTIVE', label: `Currently Inside (${activePasses.length})`, icon: UserCheck },
          { key: 'PENDING', label: `Pending & Pre-Approved (${pendingPasses.length + approvedPrePasses.length})`, icon: Clock },
          { key: 'DIRECTORY', label: 'Resident Directory', icon: PhoneCall },
          { key: 'HISTORY', label: 'Visitor Logs History', icon: History },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition whitespace-nowrap ${
                tab === item.key
                  ? 'bg-ocean-deep text-white shadow-xs dark:bg-ocean-cyan dark:text-slate-900'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Currently Inside Premises */}
      {tab === 'ACTIVE' && (
        <div className="space-y-4">
          {activePasses.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No Visitors Currently Inside"
              description="All logged visitors have checked out. When visitors arrive, log their entry to track them here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePasses.map((p) => (
                <div
                  key={p.id}
                  className="bg-surface-main p-5 rounded-3xl border border-line-subtle shadow-saas-card hover:shadow-saas-card-hover transition flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ocean-cyan block">
                          Visiting Flat {p.room?.roomNumber}
                        </span>
                        <h3 className="text-base font-bold text-content-primary mt-0.5">
                          {p.visitorName}
                        </h3>
                      </div>
                      <StatusBadge status="CHECKED_IN" size="xs" />
                    </div>

                    <div className="mt-3 p-3 rounded-2xl bg-surface-secondary/70 border border-line-subtle space-y-1.5 text-xs text-content-secondary">
                      <p className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-ocean-cyan" />
                        <span className="font-medium text-content-primary">{p.phone}</span>
                      </p>
                      {p.vehicleNumber && (
                        <p className="flex items-center space-x-2">
                          <Car className="w-3.5 h-3.5 text-ocean-violet" />
                          <span className="font-mono">{p.vehicleNumber}</span>
                        </p>
                      )}
                      <p className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>In: {p.checkIn ? new Date(p.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                      </p>
                    </div>

                    {p.verificationNotes && (
                      <p className="text-[11px] text-content-muted mt-2 italic bg-surface-secondary/40 p-2 rounded-xl">
                        "{p.verificationNotes}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleCheckOut(p.id, p.visitorName)}
                    className="w-full py-2.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border border-red-500/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Check Out Visitor</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Pending & Pre-Approved */}
      {tab === 'PENDING' && (
        <div className="space-y-6">
          {/* Pre-Approved Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider flex items-center space-x-2">
              <BadgeCheck className="w-4 h-4 text-ocean-violet" />
              <span>Resident Pre-Approved Visitors (Ready for Single-Click Check-In)</span>
            </h3>

            {approvedPrePasses.length === 0 ? (
              <p className="text-xs text-content-muted italic bg-surface-main p-4 rounded-2xl border border-line-subtle">
                No pre-approved expected guests at this moment.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedPrePasses.map((p) => (
                  <div
                    key={p.id}
                    className="bg-surface-main p-5 rounded-3xl border border-ocean-violet/30 shadow-saas-card flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-ocean-violet block">
                            Invited to Flat {p.room?.roomNumber}
                          </span>
                          <h4 className="text-base font-bold text-content-primary">{p.visitorName}</h4>
                        </div>
                        <StatusBadge status="APPROVED" size="xs" />
                      </div>

                      <div className="mt-3 p-3 rounded-xl bg-surface-secondary space-y-1 text-xs text-content-secondary">
                        <p>Phone: <span className="font-medium text-content-primary">{p.phone}</span></p>
                        {p.vehicleNumber && <p>Vehicle: <span className="font-mono">{p.vehicleNumber}</span></p>}
                        <p>Purpose: <span className="font-semibold">{p.purpose}</span></p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCheckInApproved(p.id, p.visitorName)}
                      className="w-full py-2.5 bg-ocean-cyan hover:bg-ocean-cyanHover text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center justify-center space-x-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Check In Now</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Approval Section */}
          <div className="space-y-3 pt-4 border-t border-line-subtle">
            <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Gate Entry Requests Awaiting Resident Confirmation</span>
            </h3>

            {pendingPasses.length === 0 ? (
              <p className="text-xs text-content-muted italic bg-surface-main p-4 rounded-2xl border border-line-subtle">
                No entry requests currently pending resident reply.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPasses.map((p) => (
                  <div
                    key={p.id}
                    className="bg-surface-main p-5 rounded-3xl border border-amber-500/30 shadow-saas-card space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                          Waiting for Flat {p.room?.roomNumber}
                        </span>
                        <h4 className="text-base font-bold text-content-primary">{p.visitorName}</h4>
                      </div>
                      <StatusBadge status="PENDING" size="xs" />
                    </div>

                    <p className="text-xs text-content-secondary">
                      Notification sent to resident portal. System is awaiting resident's approval.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Reference Resident Directory */}
      {tab === 'DIRECTORY' && (
        <div className="bg-surface-main rounded-3xl border border-line-subtle shadow-saas-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-content-primary">Resident Phone Directory</h3>
              <p className="text-xs text-content-secondary">Lookup contact numbers to call residents for entry confirmation</p>
            </div>

            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
              <input
                type="text"
                placeholder="Search flat number or resident name..."
                value={searchDirectory}
                onChange={(e) => setSearchDirectory(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-surface-secondary text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="table-container">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line-subtle text-content-muted uppercase font-bold text-[10px] bg-surface-secondary/40">
                  <th className="py-3 px-4">Flat #</th>
                  <th className="py-3 px-4">Resident Full Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4 text-right">Floor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle">
                {filteredDirectory.map((d, idx) => (
                  <tr key={idx} className="hover:bg-surface-secondary/50 transition">
                    <td className="py-3 px-4 font-extrabold text-content-primary">
                      <span className="px-2.5 py-1 rounded-lg bg-ocean-cyan/10 text-ocean-cyan border border-ocean-cyan/30 text-xs font-mono">
                        Flat {d.room?.roomNumber || d.roomNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-content-primary">
                      {d.fullName || 'Registered Resident'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-content-secondary">
                      {d.phone}
                    </td>
                    <td className="py-3 px-4 text-right text-content-muted">
                      Floor {d.room?.floorNumber || '1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: History Visitor Logs */}
      {tab === 'HISTORY' && (
        <div className="bg-surface-main rounded-3xl border border-line-subtle shadow-saas-card p-6 space-y-4">
          <h3 className="text-base font-bold text-content-primary">Visitor Logs & History</h3>
          <div className="table-container">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line-subtle text-content-muted uppercase font-bold text-[10px] bg-surface-secondary/40">
                  <th className="py-3 px-4">Visitor Name</th>
                  <th className="py-3 px-4">Flat Visited</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Audit Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle">
                {historyPasses.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-secondary/50 transition">
                    <td className="py-3 px-4 font-bold text-content-primary">
                      {p.visitorName}
                      <span className="block text-[10px] text-content-muted font-normal">{p.phone}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-ocean-cyan">
                      Flat {p.room?.roomNumber}
                    </td>
                    <td className="py-3 px-4 text-content-secondary">
                      {p.checkIn ? new Date(p.checkIn).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-content-secondary">
                      {p.checkOut ? new Date(p.checkOut).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} size="xs" />
                    </td>
                    <td className="py-3 px-4 text-[11px] text-content-muted italic max-w-xs truncate">
                      {p.verificationNotes || 'Standard Gate Log'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Visitor Entry Modal */}
      <Modal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        title="Log Visitor Entry at Gate"
        subtitle="Select destination flat and choose verification workflow"
        icon={Shield}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleEntrySubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 text-red-600 text-xs rounded-xl">{error}</div>}

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-secondary rounded-2xl border border-line-subtle text-xs font-bold">
            <button
              type="button"
              onClick={() => setEntryMode('CALL_CONFIRMED')}
              className={`py-2 px-3 rounded-xl transition ${
                entryMode === 'CALL_CONFIRMED'
                  ? 'bg-surface-main text-ocean-cyan shadow-xs'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              Direct Entry (Phone Verified)
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('REQUEST_ENTRY')}
              className={`py-2 px-3 rounded-xl transition ${
                entryMode === 'REQUEST_ENTRY'
                  ? 'bg-surface-main text-ocean-cyan shadow-xs'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
            >
              In-App Resident Approval
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-content-primary uppercase mb-1">Destination Flat</label>
              <select
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
              >
                {occupiedRooms.map((r) => (
                  <option key={r.id} value={r.roomNumber}>Flat {r.roomNumber}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-content-primary uppercase mb-1">Visit Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
              >
                <option value="GUEST">Guest / Personal</option>
                <option value="DELIVERY">Delivery / Courier</option>
                <option value="MAINTENANCE">Contractor / Repair</option>
                <option value="CAB">Cab / Taxi</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase mb-1">Visitor Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Anand Sharma"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-content-primary uppercase mb-1">Visitor Mobile</label>
              <input
                type="text"
                required
                placeholder="+91 9123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-content-primary uppercase mb-1">Vehicle # (Optional)</label>
              <input
                type="text"
                placeholder="KL-07-CD-1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl font-mono uppercase"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowEntryModal(false)}
              className="px-4 py-2 text-xs font-semibold text-content-secondary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-ocean-cyan hover:bg-ocean-cyanHover rounded-xl shadow-xs"
            >
              {entryMode === 'CALL_CONFIRMED' ? 'Check In Visitor Now' : 'Send Approval Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
