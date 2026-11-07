import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  Shield, UserCheck, LogOut, Clock, Car, DoorClosed, 
  AlertCircle, CheckCircle2, History, Plus, Check, X,
  Users, Search, Calendar, BadgeCheck, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function GatekeeperPage() {
  const { user, isSecurity, isAdmin } = useAuth();
  const [activePasses, setActivePasses] = useState([]);
  const [allPasses, setAllPasses] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tab, setTab] = useState('ACTIVE'); // 'ACTIVE', 'PENDING', 'DIRECTORY', 'HISTORY'
  const [loading, setLoading] = useState(true);

  // Form states
  const [entryMode, setEntryMode] = useState('CALL_CONFIRMED'); // 'CALL_CONFIRMED' (Security verified) or 'REQUEST_ENTRY' (In-app resident approval)
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
        // Direct entry: Security approved with internal confirmation note
        await api.post('/visitor-passes/call-confirmed', payload);
        // Also sync legacy /visitors/check-in
        api.post('/visitors/check-in', { visitorName, phone, vehicleNumber, roomNumber, purpose }).catch(() => {});
        setSuccess(`✓ Checked in ${visitorName} for Room ${roomNumber} (Security Verified by ${guardName})`);
      } else {
        // Request in-app resident approval
        await api.post('/visitor-passes/request', payload);
        setSuccess(`✓ Entry request sent to resident of Room ${roomNumber}. Waiting for approval!`);
        setTab('PENDING');
      }

      setVisitorName('');
      setPhone('');
      setVehicleNumber('');
      loadData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process visitor pass');
    }
  };

  const handleCheckInApproved = async (passId, name) => {
    try {
      await api.put(`/visitor-passes/${passId}/check-in`);
      setSuccess(`Checked in ${name} successfully.`);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Failed to check in: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCheckOut = async (passId, name) => {
    try {
      await api.put(`/visitor-passes/${passId}/check-out`);
      api.put(`/visitors/${passId}/check-out`).catch(() => {});
      setSuccess(`Checked out ${name} successfully.`);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Failed to check out: ' + (err.response?.data?.message || err.message));
    }
  };

  const pendingPasses = allPasses.filter(p => p.status === 'PENDING');
  const approvedPrePasses = allPasses.filter(p => p.status === 'APPROVED');
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED');

  const filteredDirectory = directory.filter(d => {
    const rNum = d.room?.roomNumber || d.roomNumber || '';
    const name = d.fullName || d.user?.fullName || '';
    const ph = d.phone || d.user?.phone || '';
    const q = searchDirectory.toLowerCase();
    return rNum.toLowerCase().includes(q) || name.toLowerCase().includes(q) || ph.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Gatekeeper Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Gatekeeper Terminal • Real-Time Entry Logs</span>
          </div>
          <h2 className="text-2xl font-bold">SNNS Apartment Gatekeeper</h2>
          <p className="text-slate-300 text-sm mt-1">
            Register visitors for occupied units, record security verification notes, and monitor entry approvals.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs text-center">
            <span className="text-slate-300 block">Pending Approvals</span>
            <span className="text-lg font-extrabold text-amber-300">{pendingPasses.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs text-center">
            <span className="text-slate-300 block">Currently Inside</span>
            <span className="text-lg font-extrabold text-emerald-300">{activePasses.length}</span>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Grid: Check-in Form + Tabbed Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-In Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs h-fit">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-brand-600" />
            <span>Gate Entry Pass</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">Register visitor entry for occupied units.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Verification Mode Selector */}
          <div className="mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
              Verification Mode
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setEntryMode('CALL_CONFIRMED')}
                className={`py-2 px-2 rounded-lg font-semibold text-center transition flex flex-col items-center justify-center gap-1 ${
                  entryMode === 'CALL_CONFIRMED'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <BadgeCheck className="w-4 h-4" />
                <span className="text-[11px] leading-tight">Security Direct Approval</span>
              </button>
              <button
                type="button"
                onClick={() => setEntryMode('REQUEST_ENTRY')}
                className={`py-2 px-2 rounded-lg font-semibold text-center transition flex flex-col items-center justify-center gap-1 ${
                  entryMode === 'REQUEST_ENTRY'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="text-[11px] leading-tight">Request In-App Approval</span>
              </button>
            </div>

            {/* Direct Security Approval Note details */}
            {entryMode === 'CALL_CONFIRMED' ? (
              <div className="p-2.5 bg-white rounded-lg border border-amber-200 space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                    Security Guard Name
                  </label>
                  <input
                    type="text"
                    required
                    value={guardName}
                    onChange={(e) => {
                      setGuardName(e.target.value);
                      setVerificationNote(`Confirmed with resident via phone call by Security Guard ${e.target.value}`);
                    }}
                    placeholder="Duty Guard Name"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                    Audit Verification Note
                  </label>
                  <input
                    type="text"
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 font-mono text-slate-700"
                  />
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 px-1 italic">
                Sends a real-time notification to the resident's portal to accept or deny entry.
              </p>
            )}
          </div>

          <form onSubmit={handleEntrySubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Destination Room (Occupied Units Only)
              </label>
              <select
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {occupiedRooms.length === 0 ? (
                  <option value="" disabled>No occupied rooms found</option>
                ) : (
                  occupiedRooms.map((r) => {
                    const resident = directory.find(d => (d.room?.roomNumber === r.roomNumber || d.roomNumber === r.roomNumber));
                    const residentName = resident?.fullName || resident?.user?.fullName;
                    return (
                      <option key={r.id} value={r.roomNumber}>
                        Room {r.roomNumber} {residentName ? `(${residentName})` : '(Occupied)'}
                      </option>
                    );
                  })
                )}
              </select>
              {occupiedRooms.length === 0 && (
                <p className="text-[10px] text-red-500 mt-1">
                  All rooms are currently vacant. Visitors can only be registered for occupied flats.
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Visitor Full Name
              </label>
              <input
                type="text"
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="e.g. Anand Sharma"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9123456789"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="GUEST">Guest / Relative</option>
                  <option value="DELIVERY">Delivery / Courier</option>
                  <option value="CAB">Cab / Taxi</option>
                  <option value="SERVICE">Service / Maintenance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vehicle (Optional)
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="KL-07-CD-1234"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={occupiedRooms.length === 0}
              className={`w-full py-2.5 px-4 text-white font-bold rounded-xl shadow-sm transition text-xs mt-2 flex items-center justify-center space-x-2 disabled:opacity-50 ${
                entryMode === 'CALL_CONFIRMED'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {entryMode === 'CALL_CONFIRMED' ? (
                <>
                  <BadgeCheck className="w-4 h-4" />
                  <span>Approve & Allow Entry (Security Verified)</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Send Approval Request to Resident</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tabbed Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition ${
                tab === 'ACTIVE'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Inside ({activePasses.length})
            </button>
            <button
              onClick={() => setTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                tab === 'PENDING'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pending & Pre-Approved</span>
              {(pendingPasses.length > 0 || approvedPrePasses.length > 0) && (
                <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                  {pendingPasses.length + approvedPrePasses.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('DIRECTORY')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                tab === 'DIRECTORY'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Resident Directory</span>
            </button>
            <button
              onClick={() => setTab('HISTORY')}
              className={`px-3 py-1.5 rounded-lg transition ${
                tab === 'HISTORY'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pass History ({allPasses.length})
            </button>
          </div>

          {/* Active Inside Table */}
          {tab === 'ACTIVE' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              {activePasses.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No visitors currently inside the premises.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-3 px-4">Visitor</th>
                        <th className="py-3 px-4">Room #</th>
                        <th className="py-3 px-4">Purpose</th>
                        <th className="py-3 px-4">Verification Note</th>
                        <th className="py-3 px-4">Check-In Time</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                      {activePasses.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{p.visitorName}</div>
                            <div className="text-[11px] text-slate-400">{p.phone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                              Room {p.room?.roomNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {p.purpose}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <span className="text-[11px] text-slate-600 block truncate" title={p.verificationNotes}>
                              {p.verificationNotes || (p.requestedBy === 'TENANT' ? 'Pre-Approved by Resident' : 'Security Verified')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {p.checkIn ? new Date(p.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleCheckOut(p.id, p.visitorName)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200 transition"
                            >
                              Check Out
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Pending & Pre-Approved Tab */}
          {tab === 'PENDING' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-4 space-y-4">
              {/* Pre-Approved Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5 text-emerald-700">
                  <BadgeCheck className="w-4 h-4" />
                  <span>Resident Pre-Approved Visitors (Ready to Check In)</span>
                </h4>
                {approvedPrePasses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No pre-approved expected guests at this moment.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {approvedPrePasses.map((p) => (
                      <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {p.visitorName} <span className="text-slate-400">({p.phone})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Room {p.room?.roomNumber} • Purpose: {p.purpose} {p.vehicleNumber && `• Vehicle: ${p.vehicleNumber}`}
                          </div>
                          {p.expectedVisitTime && (
                            <div className="text-[10px] text-emerald-600 font-semibold">
                              Expected: {new Date(p.expectedVisitTime).toLocaleString()}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {p.verificationNotes || 'Pre-approved in resident portal'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCheckInApproved(p.id, p.visitorName)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                        >
                          Check In Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Approvals Section */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5 text-amber-700">
                  <Clock className="w-4 h-4" />
                  <span>Awaiting Resident In-App Approval</span>
                </h4>
                {pendingPasses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No entry requests currently awaiting resident response.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pendingPasses.map((p) => (
                      <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {p.visitorName} <span className="text-slate-400">({p.phone})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Destination: Room {p.room?.roomNumber} • Requested at {new Date(p.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold animate-pulse">
                          Waiting for Resident
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resident Directory Tab (Reference lookup without confusing call triggers) */}
          {tab === 'DIRECTORY' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Resident Phone Directory
                  </h4>
                  <p className="text-xs text-slate-500">Official resident directory for security reference.</p>
                </div>
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search room or resident..."
                    value={searchDirectory}
                    onChange={(e) => setSearchDirectory(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Room</th>
                      <th className="py-2.5 px-3">Resident Name</th>
                      <th className="py-2.5 px-3">Contact Phone</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {filteredDirectory.map((d, idx) => {
                      const rNum = d.room?.roomNumber || d.roomNumber || '—';
                      const name = d.fullName || d.user?.fullName || 'Resident';
                      const phoneNum = d.phone || d.user?.phone || '—';
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-bold text-brand-700">
                            Room {rNum}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700 font-bold">
                            {phoneNum}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* History Tab */}
          {tab === 'HISTORY' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-4">Visitor</th>
                      <th className="py-3 px-4">Room #</th>
                      <th className="py-3 px-4">Purpose</th>
                      <th className="py-3 px-4">Verification Note</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Check-In</th>
                      <th className="py-3 px-4">Check-Out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {allPasses.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{p.visitorName}</div>
                          <div className="text-[11px] text-slate-400">{p.phone}</div>
                        </td>
                        <td className="py-3 px-4">Room {p.room?.roomNumber}</td>
                        <td className="py-3 px-4">{p.purpose}</td>
                        <td className="py-3 px-4 max-w-xs">
                          <span className="text-[11px] text-slate-500 block truncate" title={p.verificationNotes}>
                            {p.verificationNotes || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'CHECKED_IN'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : p.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.status === 'REJECTED'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : p.status === 'PENDING'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {p.checkIn ? new Date(p.checkIn).toLocaleString() : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {p.checkOut ? new Date(p.checkOut).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
