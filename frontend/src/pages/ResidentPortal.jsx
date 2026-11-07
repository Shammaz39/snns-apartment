import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  QrCode, Upload, CheckCircle2, Clock, XCircle, FileText,
  Wrench, Sparkles, Calendar, AlertCircle, Phone, PhoneCall,
  UserCheck, Shield, Check, X, User, Edit3, Image, FileBadge,
  Zap, ShoppingCart, HeartPulse, ShieldAlert, Flame
} from 'lucide-react';

export default function ResidentPortal() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Live Visitor Notifications
  const [unreadNotifications, setUnreadNotifications] = useState([]);

  // Pre-Approve Visitor form
  const [preVisitorName, setPreVisitorName] = useState('');
  const [prePhone, setPrePhone] = useState('');
  const [preVehicle, setPreVehicle] = useState('');
  const [prePurpose, setPrePurpose] = useState('GUEST');
  const [preExpectedTime, setPreExpectedTime] = useState('');
  const [preSuccess, setPreSuccess] = useState('');
  const [preError, setPreError] = useState('');

  // Tenant Profile state
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profName, setProfName] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profAadhaar, setProfAadhaar] = useState('');
  const [profMembers, setProfMembers] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [profSuccess, setProfSuccess] = useState('');

  // Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  // Service Complaint state
  const [complaintCategory, setComplaintCategory] = useState('PLUMBING');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  useEffect(() => {
    loadResidentData();
    // Poll unread visitor notifications every 4 seconds
    const interval = setInterval(pollNotifications, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const loadResidentData = async () => {
    try {
      setLoading(true);
      const [settingsRes, billsRes, emRes, profileRes] = await Promise.all([
        api.get('/settings/public'),
        user?.roomId ? api.get(`/bills/room/${user.roomId}`) : Promise.resolve({ data: [] }),
        api.get('/emergency-contacts').catch(() => ({ data: [] })),
        user?.userId ? api.get(`/tenants/profile/${user.userId}`).catch(() => ({ data: null })) : Promise.resolve({ data: null })
      ]);
      setSettings(settingsRes.data);
      setBills(billsRes.data || []);
      setEmergencyContacts(emRes.data || []);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setProfName(profileRes.data.fullName || '');
        setProfPhone(profileRes.data.phone || '');
        setProfEmail(profileRes.data.email || '');
        setProfAadhaar(profileRes.data.aadhaarNumber || '');
        setProfMembers(profileRes.data.memberDetails || '');
      }

      if (billsRes.data?.length > 0) {
        setSelectedBill(billsRes.data[0]);
      }
      pollNotifications();
    } catch (e) {
      console.error('Failed to load resident data', e);
    } finally {
      setLoading(false);
    }
  };

  const pollNotifications = async () => {
    if (!user?.roomId) return;
    try {
      const res = await api.get(`/notifications/room/${user.roomId}/unread`);
      setUnreadNotifications(res.data || []);
    } catch (e) {
      // ignore transient poll errors
    }
  };

  const handleApproveVisitor = async (notificationId, relatedPassId) => {
    try {
      if (relatedPassId) {
        await api.put(`/visitor-passes/${relatedPassId}/approve`);
      }
      await api.put(`/notifications/${notificationId}/read`);
      pollNotifications();
      alert('✓ Visitor entry approved! Security gate has been notified.');
    } catch (err) {
      alert('Failed to approve visitor: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectVisitor = async (notificationId, relatedPassId) => {
    try {
      if (relatedPassId) {
        await api.put(`/visitor-passes/${relatedPassId}/reject`);
      }
      await api.put(`/notifications/${notificationId}/read`);
      pollNotifications();
      alert('Visitor entry has been denied.');
    } catch (err) {
      alert('Failed to reject visitor: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePreApproveSubmit = async (e) => {
    e.preventDefault();
    setPreError('');
    setPreSuccess('');
    try {
      await api.post('/visitor-passes/pre-approve', {
        visitorName: preVisitorName,
        phone: prePhone,
        vehicleNumber: preVehicle,
        roomId: user.roomId,
        roomNumber: user.roomNumber,
        purpose: prePurpose,
        requestType: 'TENANT_PRE_APPROVE',
        expectedVisitTime: preExpectedTime || null
      });

      setPreSuccess(`✓ Expected visitor ${preVisitorName} pre-approved! Security will allow entry.`);
      setPreVisitorName('');
      setPrePhone('');
      setPreVehicle('');
      setPreExpectedTime('');
      setTimeout(() => setPreSuccess(''), 5000);
    } catch (err) {
      setPreError(err.response?.data?.message || err.message || 'Failed to pre-approve visitor');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (profName) formData.append('fullName', profName);
      if (profPhone) formData.append('phone', profPhone);
      if (profEmail) formData.append('email', profEmail);
      if (profAadhaar) formData.append('aadhaarNumber', profAadhaar);
      if (profMembers) formData.append('memberDetails', profMembers);
      if (photoFile) formData.append('photo', photoFile);
      if (aadhaarFile) formData.append('aadhaarDoc', aadhaarFile);

      const res = await api.put(`/tenants/profile/${user.userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProfile(res.data);
      setEditingProfile(false);
      setProfSuccess('✓ Profile updated successfully!');
      setTimeout(() => setProfSuccess(''), 4000);
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!transactionRef) {
      alert('Please enter your UPI transaction reference number (UTR)');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('transactionRef', transactionRef);
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await api.post(`/bills/${selectedBill.id}/pay`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Payment receipt submitted! Status is now Pending Verification by Admin.');
      setTransactionRef('');
      setReceiptFile(null);
      loadResidentData();
    } catch (e) {
      alert('Failed to submit receipt: ' + (e.response?.data?.message || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLodgeComplaint = async (e) => {
    e.preventDefault();
    if (!user?.roomId) return;

    try {
      await api.post('/complaints', {
        roomId: user.roomId,
        category: complaintCategory,
        title: complaintTitle,
        description: complaintDesc
      });
      setComplaintSuccess(true);
      setComplaintTitle('');
      setComplaintDesc('');
      setTimeout(() => setComplaintSuccess(false), 4000);
    } catch (e) {
      alert('Failed to lodge complaint: ' + (e.response?.data?.message || e.message));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PLUMBER': return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'ELECTRICIAN': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'SUPERMARKET': return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
      case 'HOSPITAL': return <HeartPulse className="w-4 h-4 text-red-600" />;
      case 'POLICE': return <ShieldAlert className="w-4 h-4 text-indigo-600" />;
      case 'FIRE': return <Flame className="w-4 h-4 text-orange-600" />;
      default: return <Phone className="w-4 h-4 text-slate-600" />;
    }
  };

  const latestBill = selectedBill || (bills.length > 0 ? bills[0] : null);
  const qrUrl = settings?.qrCodePath ? `/api/files/${settings.qrCodePath}` : null;

  return (
    <div className="space-y-6">
      {/* Live Visitor Alert Notification Banners */}
      {unreadNotifications.map((n) => (
        <div
          key={n.id}
          className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-bounce"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm uppercase tracking-wide">
                🔔 Gate Visitor Entry Request
              </div>
              <div className="text-xs text-amber-50 mt-0.5">{n.message}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => handleApproveVisitor(n.id, n.relatedId)}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition"
            >
              <Check className="w-4 h-4" />
              <span>Allow Entry</span>
            </button>
            <button
              onClick={() => handleRejectVisitor(n.id, n.relatedId)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition"
            >
              <X className="w-4 h-4" />
              <span>Deny</span>
            </button>
          </div>
        </div>
      ))}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {profile?.fullName || user?.fullName || 'Resident'}!</h2>
          <p className="text-brand-200 text-sm mt-1">
            Room #{user?.roomNumber || '101'} • {settings?.apartmentName || 'SNNS Apartment'}
          </p>
        </div>
        <button
          onClick={() => setEditingProfile(!editingProfile)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition flex items-center space-x-2"
        >
          <User className="w-4 h-4" />
          <span>{editingProfile ? 'Close Profile View' : 'My Resident Profile & KYC'}</span>
        </button>
      </div>

      {profSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{profSuccess}</span>
        </div>
      )}

      {/* Profile & KYC View / Edit Modal/Section */}
      {editingProfile && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Resident Profile & Aadhaar KYC</h3>
              <p className="text-xs text-slate-500">View and update your personal info, photo, and identity documents.</p>
            </div>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              Room {user?.roomNumber}
            </span>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Mobile Phone</label>
                <input
                  type="text"
                  required
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Aadhaar Card Number</label>
                <input
                  type="text"
                  value={profAadhaar}
                  onChange={(e) => setProfAadhaar(e.target.value)}
                  placeholder="e.g. 1234-5678-9012"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Family Members / Roommates Details</label>
              <textarea
                rows="2"
                value={profMembers}
                onChange={(e) => setProfMembers(e.target.value)}
                placeholder="e.g. Spouse (Anju), Child (Aarav)"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1.5">
                  <Image className="w-4 h-4 text-brand-600" />
                  <span>Update Profile Photo</span>
                </label>
                {profile?.photoPath && (
                  <div className="mb-2">
                    <img
                      src={`/api/files/${profile.photoPath}`}
                      alt="Profile"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="text-xs text-slate-600"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1.5">
                  <FileBadge className="w-4 h-4 text-indigo-600" />
                  <span>Update Aadhaar Document</span>
                </label>
                {profile?.aadhaarDocPath && (
                  <div className="mb-2">
                    <a
                      href={`/api/files/${profile.aadhaarDocPath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      View Uploaded Document
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setAadhaarFile(e.target.files[0])}
                  className="text-xs text-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition"
              >
                Save Profile Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Bills & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Bill Overview & Pre-Approve Visitor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pre-Approve Visitor Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Pre-Approve Expected Visitor</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Pre-register guests or delivery couriers so the security guard allows seamless entry without calling you.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Gate Pass
              </span>
            </div>

            {preSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold">
                {preSuccess}
              </div>
            )}
            {preError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold">
                {preError}
              </div>
            )}

            <div className="mb-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Designated Flat (Locked to Your Unit)
                </span>
                <span className="text-sm font-extrabold text-brand-700">
                  Room {user?.roomNumber || '101'}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex items-center space-x-1">
                <span>🔒</span>
                <span>Only your flat</span>
              </span>
            </div>

            <form onSubmit={handlePreApproveSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Visitor Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Nair"
                    value={preVisitorName}
                    onChange={(e) => setPreVisitorName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Visitor Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9845011223"
                    value={prePhone}
                    onChange={(e) => setPrePhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Purpose</label>
                  <select
                    value={prePurpose}
                    onChange={(e) => setPrePurpose(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="GUEST">Guest / Relative</option>
                    <option value="DELIVERY">Delivery Agent</option>
                    <option value="CAB">Cab / Taxi</option>
                    <option value="SERVICE">Service / Repair</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Vehicle (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. KL-07-AA-1111"
                    value={preVehicle}
                    onChange={(e) => setPreVehicle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Expected Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={preExpectedTime}
                    onChange={(e) => setPreExpectedTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Pre-Approve Visitor for Room {user?.roomNumber}</span>
              </button>
            </form>
          </div>

          {/* Current Bill Section */}
          {latestBill ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Due</span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Maintenance & Rent Bill ({latestBill.billingMonth})
                  </h3>
                </div>

                <span
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    latestBill.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : latestBill.status === 'PENDING_VERIFICATION'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : latestBill.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {latestBill.status === 'PAID' && <CheckCircle2 className="w-4 h-4" />}
                  {latestBill.status === 'PENDING_VERIFICATION' && <Clock className="w-4 h-4" />}
                  {latestBill.status === 'REJECTED' && <XCircle className="w-4 h-4" />}
                  <span>{latestBill.status}</span>
                </span>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Room Rent</span>
                  <p className="text-sm font-bold text-slate-900">₹{latestBill.rentAmount}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Lift Maintenance</span>
                  <p className="text-sm font-bold text-slate-900">₹{latestBill.liftMaintenanceFee}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Waste Management</span>
                  <p className="text-sm font-bold text-slate-900">₹{latestBill.wasteManagementFee}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-brand-50 rounded-xl border border-brand-100">
                <span className="text-sm font-bold text-brand-900">Total Payable Amount</span>
                <span className="text-2xl font-black text-brand-800">₹{latestBill.totalAmount}</span>
              </div>

              {/* Status Notice */}
              {latestBill.status === 'PENDING_VERIFICATION' && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                  <p className="font-bold flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Payment Verification Pending</span>
                  </p>
                  <p className="mt-1">
                    Your payment receipt (UTR: <strong>{latestBill.transactionRef}</strong>) has been submitted to the Admin. It will be marked as PAID once verified.
                  </p>
                </div>
              )}

              {latestBill.status === 'PAID' && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                  <p className="font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Payment Confirmed & Verified</span>
                  </p>
                  <p className="mt-1 text-emerald-800">
                    Paid on: {new Date(latestBill.paidAt || Date.now()).toLocaleDateString()}. Thank you!
                  </p>
                </div>
              )}

              {/* Submit Receipt Form (if not PAID) */}
              {latestBill.status !== 'PAID' && (
                <form onSubmit={handlePaymentSubmit} className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 2: Upload Payment Proof (Screenshot & UTR)
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      UPI Transaction ID / UTR Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 329048192849"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Payment Screenshot / Receipt
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Receipt...' : 'Submit Payment for Verification'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
              <p className="font-bold text-slate-800">No pending bills for your room!</p>
              <p className="text-xs mt-1">All maintenance fees and rent are up to date.</p>
            </div>
          )}

          {/* Service Request / Complaint Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-1">Lodge Maintenance Request</h3>
            <p className="text-xs text-slate-500 mb-4">
              Report plumbing leaks, electrical issues, or lift maintenance to the apartment manager.
            </p>

            {complaintSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold">
                ✓ Complaint submitted successfully! The manager has been alerted.
              </div>
            )}

            <form onSubmit={handleLodgeComplaint} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Issue Category</label>
                  <select
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="PLUMBING">Plumbing (Water / Tap / Pipes)</option>
                    <option value="ELECTRICAL">Electrical (Switch / Wiring / Lights)</option>
                    <option value="LIFT">Lift Maintenance</option>
                    <option value="WASTE">Waste Management / Disposal</option>
                    <option value="OTHER">Other Issue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Summary Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bathroom tap leaking"
                    value={complaintTitle}
                    onChange={(e) => setComplaintTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Description</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Describe the issue in detail..."
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (1 Col): Emergency Contacts & Scan UPI */}
        <div className="space-y-6">
          {/* Emergency Helplines & Contacts Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                <PhoneCall className="w-4 h-4 text-indigo-600" />
                <span>Emergency Helplines</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">Click to Call</span>
            </div>

            {emergencyContacts.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No emergency numbers published yet.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {emergencyContacts.map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                        {getTypeIcon(c.contactType)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{c.name}</div>
                        <div className="text-[10px] text-slate-500">{c.contactType}</div>
                      </div>
                    </div>
                    <a
                      href={`tel:${c.phone.replace(/\s+/g, '')}`}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition flex items-center space-x-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Official UPI QR Code */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 text-center">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">
              Step 1: Scan & Pay
            </span>
            <h3 className="font-extrabold text-slate-900 mb-1">Apartment UPI QR Code</h3>
            <p className="text-xs text-slate-500 mb-4">
              Scan with GPay, PhonePe, Paytm, or any UPI app.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 inline-block mb-3">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Apartment UPI QR"
                  className="w-48 h-48 object-contain mx-auto rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 bg-white border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-4">
                  <QrCode className="w-16 h-16 text-slate-300 mb-2" />
                  <span className="text-xs font-semibold text-slate-400">
                    Admin has not uploaded custom QR image yet
                  </span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Official UPI ID</span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                {settings?.upiId || 'snnsapartment@okaxis'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
