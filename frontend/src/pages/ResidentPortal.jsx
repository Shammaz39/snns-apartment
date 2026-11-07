import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  QrCode, Upload, CheckCircle2, Clock, XCircle, FileText,
  Wrench, Sparkles, Calendar, AlertCircle, Phone, PhoneCall,
  UserCheck, Shield, Check, X, User, Edit3, Image, FileBadge,
  Zap, ShoppingCart, HeartPulse, ShieldAlert, Flame, BellRing,
  Lock, ArrowRight, ShieldCheck, CreditCard
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

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

      setPreSuccess(`✓ Expected visitor "${preVisitorName}" pre-approved! Security will allow seamless entry.`);
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
      setProfSuccess('✓ Profile & KYC details updated successfully!');
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
      case 'PLUMBER': return <Wrench className="w-4 h-4 text-ocean-cyan" />;
      case 'ELECTRICIAN': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'SUPERMARKET': return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
      case 'HOSPITAL': return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'POLICE': return <ShieldAlert className="w-4 h-4 text-ocean-violet" />;
      case 'FIRE': return <Flame className="w-4 h-4 text-orange-500" />;
      default: return <Phone className="w-4 h-4 text-content-light-secondary dark:text-content-dark-secondary" />;
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
          className="p-4 rounded-2xl bg-amber-500 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse border border-amber-400"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <BellRing className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-xs uppercase tracking-wider text-amber-100">
                Gate Entry Request • Immediate Action Needed
              </div>
              <div className="text-sm font-bold text-white mt-0.5">{n.message}</div>
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
              className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition"
            >
              <X className="w-4 h-4" />
              <span>Deny</span>
            </button>
          </div>
        </div>
      ))}

      {/* Resident Hero Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-ocean-deep via-ocean-deep/95 to-slate-900 text-white shadow-lg border border-ocean-cyan/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-ocean-cyan/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-ocean-cyan/20 text-ocean-cyan border border-ocean-cyan/30 text-xs font-bold">
              <span>Unit #{user?.roomNumber || '101'}</span>
              <span>•</span>
              <span>{settings?.apartmentName || 'SNNS Apartment'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {profile?.fullName || user?.fullName || 'Resident'}
            </h2>
            <p className="text-xs sm:text-sm text-content-dark-secondary max-w-xl">
              Pay monthly maintenance bills, pre-approve visitor gate passes, raise service tickets, and manage KYC documents.
            </p>
          </div>

          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition flex items-center space-x-2 backdrop-blur-sm"
          >
            <User className="w-4 h-4 text-ocean-cyan" />
            <span>{editingProfile ? 'Close Profile View' : 'My Resident Profile & KYC'}</span>
          </button>
        </div>
      </div>

      {profSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{profSuccess}</span>
        </div>
      )}

      {/* Profile & KYC View / Edit Modal/Section */}
      {editingProfile && (
        <div className="p-6 rounded-2xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
            <div>
              <h3 className="text-base font-bold text-content-light-primary dark:text-content-dark-primary">
                Resident Profile & Aadhaar KYC
              </h3>
              <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
                View and update your personal info, photo, and identity documents.
              </p>
            </div>
            <span className="text-xs font-black text-ocean-cyan bg-ocean-cyan/15 px-3 py-1 rounded-full border border-ocean-cyan/30">
              Unit #{user?.roomNumber}
            </span>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                  Mobile Phone
                </label>
                <input
                  type="text"
                  required
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                  Aadhaar Card Number
                </label>
                <input
                  type="text"
                  value={profAadhaar}
                  onChange={(e) => setProfAadhaar(e.target.value)}
                  placeholder="e.g. 1234-5678-9012"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                Family Members / Roommates Details
              </label>
              <textarea
                rows="2"
                value={profMembers}
                onChange={(e) => setProfMembers(e.target.value)}
                placeholder="e.g. Spouse (Anju), Child (Aarav)"
                className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark">
                <label className="block font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1.5 flex items-center space-x-1.5">
                  <Image className="w-4 h-4 text-ocean-cyan" />
                  <span>Update Profile Photo</span>
                </label>
                {profile?.photoPath && (
                  <div className="mb-3">
                    <img
                      src={`/api/files/${profile.photoPath}`}
                      alt="Profile"
                      className="w-16 h-16 object-cover rounded-xl border border-border-light dark:border-border-dark"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="text-xs text-content-light-secondary dark:text-content-dark-secondary"
                />
              </div>

              <div className="p-4 rounded-xl bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark">
                <label className="block font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1.5 flex items-center space-x-1.5">
                  <FileBadge className="w-4 h-4 text-ocean-violet" />
                  <span>Update Aadhaar Document</span>
                </label>
                {profile?.aadhaarDocPath && (
                  <div className="mb-3">
                    <a
                      href={`/api/files/${profile.aadhaarDocPath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-ocean-cyan hover:underline flex items-center space-x-1"
                    >
                      <span>View Uploaded KYC Document</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setAadhaarFile(e.target.files[0])}
                  className="text-xs text-content-light-secondary dark:text-content-dark-secondary"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-ocean-cyan hover:bg-ocean-cyan/90 text-white font-bold rounded-xl shadow-xs transition"
              >
                Save Profile Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="py-2.5 px-4 rounded-xl bg-surface-light-secondary dark:bg-surface-dark-secondary text-content-light-secondary dark:text-content-dark-secondary font-bold transition border border-border-light dark:border-border-dark"
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
          <div className="p-6 rounded-2xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
              <div>
                <h3 className="font-bold text-content-light-primary dark:text-content-dark-primary text-sm flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>Pre-Approve Expected Visitor</span>
                </h3>
                <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
                  Pre-register guests or delivery couriers so the security guard allows seamless entry without intercom delay.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Gate Pass
              </span>
            </div>

            {preSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                {preSuccess}
              </div>
            )}
            {preError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                {preError}
              </div>
            )}

            <div className="p-3 rounded-xl bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-content-light-secondary dark:text-content-dark-secondary uppercase tracking-wider block">
                  Designated Flat (Locked to Your Unit)
                </span>
                <span className="text-sm font-black text-ocean-cyan">
                  Room #{user?.roomNumber || '101'}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-content-light-secondary dark:text-content-dark-secondary bg-surface-light dark:bg-surface-dark px-2.5 py-1 rounded-lg border border-border-light dark:border-border-dark flex items-center space-x-1.5">
                <Lock className="w-3 h-3 text-ocean-cyan" />
                <span>Unit Authenticated</span>
              </span>
            </div>

            <form onSubmit={handlePreApproveSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                    Visitor Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Nair"
                    value={preVisitorName}
                    onChange={(e) => setPreVisitorName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                    Visitor Phone
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9845011223"
                    value={prePhone}
                    onChange={(e) => setPrePhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                    Purpose
                  </label>
                  <select
                    value={prePurpose}
                    onChange={(e) => setPrePurpose(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none"
                  >
                    <option value="GUEST">Guest / Relative</option>
                    <option value="DELIVERY">Delivery Agent</option>
                    <option value="CAB">Cab / Taxi</option>
                    <option value="SERVICE">Service / Repair</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                    Vehicle (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KL-07-AA-1111"
                    value={preVehicle}
                    onChange={(e) => setPreVehicle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                    Expected Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={preExpectedTime}
                    onChange={(e) => setPreExpectedTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Pre-Approve Visitor for Unit #{user?.roomNumber}</span>
              </button>
            </form>
          </div>

          {/* Current Bill Section */}
          {latestBill ? (
            <div className="p-6 rounded-2xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-light dark:border-border-dark gap-2">
                <div>
                  <span className="text-xs font-bold text-content-light-secondary dark:text-content-dark-secondary uppercase tracking-wider">
                    Current Statement
                  </span>
                  <h3 className="text-xl font-black text-content-light-primary dark:text-content-dark-primary">
                    Maintenance & Rent Bill ({latestBill.billingMonth})
                  </h3>
                </div>

                <StatusBadge status={latestBill.status} />
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark">
                  <span className="text-xs text-content-light-secondary dark:text-content-dark-secondary font-medium">Room Rent</span>
                  <p className="text-sm font-bold text-content-light-primary dark:text-content-dark-primary mt-0.5">₹{latestBill.rentAmount}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark">
                  <span className="text-xs text-content-light-secondary dark:text-content-dark-secondary font-medium">Lift Maintenance</span>
                  <p className="text-sm font-bold text-content-light-primary dark:text-content-dark-primary mt-0.5">₹{latestBill.liftMaintenanceFee}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark">
                  <span className="text-xs text-content-light-secondary dark:text-content-dark-secondary font-medium">Waste Management</span>
                  <p className="text-sm font-bold text-content-light-primary dark:text-content-dark-primary mt-0.5">₹{latestBill.wasteManagementFee}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-ocean-cyan/10 border border-ocean-cyan/20">
                <span className="text-sm font-bold text-ocean-deep dark:text-ocean-cyan">Total Payable Amount</span>
                <span className="text-2xl font-black text-ocean-cyan">₹{latestBill.totalAmount}</span>
              </div>

              {/* Status Notice */}
              {latestBill.status === 'PENDING_VERIFICATION' && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                  <p className="font-bold flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Payment Verification Pending</span>
                  </p>
                  <p className="mt-1">
                    Your payment receipt (UTR: <strong>{latestBill.transactionRef}</strong>) has been submitted to Admin. It will be marked as PAID once verified.
                  </p>
                </div>
              )}

              {latestBill.status === 'PAID' && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs">
                  <p className="font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Payment Confirmed & Verified</span>
                  </p>
                  <p className="mt-1">
                    Paid on: {new Date(latestBill.paidAt || Date.now()).toLocaleDateString()}. Thank you!
                  </p>
                </div>
              )}

              {/* Submit Receipt Form (if not PAID) */}
              {latestBill.status !== 'PAID' && (
                <form onSubmit={handlePaymentSubmit} className="pt-4 border-t border-border-light dark:border-border-dark space-y-4">
                  <h4 className="text-sm font-bold text-content-light-primary dark:text-content-dark-primary flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-ocean-cyan" />
                    <span>Step 2: Upload Payment Proof (Screenshot & UTR)</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1.5">
                      UPI Transaction ID / UTR Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 329048192849"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1.5">
                      Payment Screenshot / Receipt
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      className="w-full text-xs text-content-light-secondary dark:text-content-dark-secondary file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-ocean-cyan/15 file:text-ocean-cyan hover:file:bg-ocean-cyan/25"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 bg-ocean-cyan hover:bg-ocean-cyan/90 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Receipt...' : 'Submit Payment for Verification'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No pending bills for your room"
              description="All maintenance fees and room rents are completely up to date."
            />
          )}

          {/* Service Request / Complaint Box */}
          <div className="p-6 rounded-2xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-content-light-primary dark:text-content-dark-primary text-base">
                Lodge Maintenance Ticket
              </h3>
              <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
                Report plumbing leaks, electrical repairs, or lift issues to the apartment management.
              </p>
            </div>

            {complaintSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                ✓ Complaint submitted successfully! The manager has been alerted.
              </div>
            )}

            <form onSubmit={handleLodgeComplaint} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                    Issue Category
                  </label>
                  <select
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none"
                  >
                    <option value="PLUMBING">Plumbing (Water / Tap / Pipes)</option>
                    <option value="ELECTRICAL">Electrical (Switch / Wiring / Lights)</option>
                    <option value="LIFT">Lift Maintenance</option>
                    <option value="WASTE">Waste Management / Disposal</option>
                    <option value="OTHER">Other Issue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                    Summary Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bathroom tap leaking"
                    value={complaintTitle}
                    onChange={(e) => setComplaintTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="Describe the issue in detail..."
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-ocean-deep text-white hover:bg-ocean-deep/90 shadow-xs transition"
              >
                Submit Maintenance Ticket
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (1 Col): Emergency Contacts & Scan UPI */}
        <div className="space-y-6">
          {/* Emergency Helplines & Contacts Card */}
          <div className="p-5 rounded-2xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border-light dark:border-border-dark">
              <h3 className="font-bold text-content-light-primary dark:text-content-dark-primary text-sm flex items-center space-x-1.5">
                <PhoneCall className="w-4 h-4 text-ocean-cyan" />
                <span>Emergency Helplines</span>
              </h3>
              <span className="text-[10px] text-content-light-secondary dark:text-content-dark-secondary font-semibold">
                Click to Call
              </span>
            </div>

            {emergencyContacts.length === 0 ? (
              <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary italic">
                No emergency numbers published yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {emergencyContacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
                        {getTypeIcon(c.contactType)}
                      </div>
                      <div>
                        <div className="font-bold text-content-light-primary dark:text-content-dark-primary text-xs">
                          {c.name}
                        </div>
                        <div className="text-[10px] text-content-light-secondary dark:text-content-dark-secondary">
                          {c.contactType}
                        </div>
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
          <div className="p-6 rounded-2xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark shadow-xs text-center space-y-3">
            <span className="text-xs font-bold text-ocean-cyan uppercase tracking-wider block">
              Step 1: Scan & Pay
            </span>
            <h3 className="font-black text-content-light-primary dark:text-content-dark-primary text-base">
              Apartment UPI QR Code
            </h3>
            <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
              Scan with GPay, PhonePe, Paytm, or any UPI app.
            </p>

            <div className="p-4 rounded-2xl bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark inline-block">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Apartment UPI QR"
                  className="w-48 h-48 object-contain mx-auto rounded-xl bg-white p-2"
                />
              ) : (
                <div className="w-48 h-48 bg-surface-light dark:bg-surface-dark border-2 border-dashed border-border-light dark:border-border-dark rounded-xl flex flex-col items-center justify-center p-4">
                  <QrCode className="w-16 h-16 text-content-light-secondary/40 dark:text-content-dark-secondary/40 mb-2" />
                  <span className="text-xs font-semibold text-content-light-secondary dark:text-content-dark-secondary">
                    Admin has not uploaded custom QR image yet
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark">
              <span className="text-[11px] text-content-light-secondary dark:text-content-dark-secondary uppercase font-semibold">
                Official UPI ID
              </span>
              <p className="text-xs font-mono font-bold text-ocean-cyan mt-0.5">
                {settings?.upiId || 'snnsapartment@okaxis'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
