import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  Phone, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, 
  Wrench, Zap, ShoppingCart, ShieldAlert, HeartPulse, Flame, HelpCircle, PhoneCall
} from 'lucide-react';

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [contactType, setContactType] = useState('PLUMBER');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/emergency-contacts');
      setContacts(res.data || []);
    } catch (err) {
      console.error('Failed to load emergency contacts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { contactType, name, phone, description };
      if (editingId) {
        await api.put(`/emergency-contacts/${editingId}`, payload);
        setSuccess('Contact updated successfully!');
      } else {
        await api.post('/emergency-contacts', payload);
        setSuccess('New emergency contact added successfully!');
      }
      resetForm();
      loadContacts();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save contact');
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setContactType(c.contactType);
    setName(c.name);
    setPhone(c.phone);
    setDescription(c.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, contactName) => {
    if (!window.confirm(`Are you sure you want to delete ${contactName}?`)) return;
    try {
      await api.delete(`/emergency-contacts/${id}`);
      setSuccess('Contact deleted successfully.');
      loadContacts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setContactType('PLUMBER');
    setName('');
    setPhone('');
    setDescription('');
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

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-2">
          <Phone className="w-3.5 h-3.5" />
          <span>Emergency Contacts & Helplines</span>
        </div>
        <h2 className="text-2xl font-bold">Community Helplines & Utility Services</h2>
        <p className="text-slate-300 text-sm mt-1">
          Add and manage numbers for plumbers, electricians, grocery delivery, and emergency services visible to all residents.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs h-fit">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center space-x-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>{editingId ? 'Edit Emergency Contact' : 'Add New Helpline / Contact'}</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {editingId ? 'Update details of this service contact.' : 'Publish a service provider number for apartment residents.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Service Category
              </label>
              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="PLUMBER">Plumber / Water Leaks</option>
                <option value="ELECTRICIAN">Electrician / Power Issues</option>
                <option value="SUPERMARKET">Supermarket / Grocery Delivery</option>
                <option value="MAINTENANCE">General Building Maintenance</option>
                <option value="HOSPITAL">Hospital / Ambulance</option>
                <option value="POLICE">Police Station / PCR</option>
                <option value="FIRE">Fire Station</option>
                <option value="OTHER">Other Emergency Service</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact / Provider Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Plumbing Services"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number (Click-to-Call)
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9845012345"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description / Timings (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Available 24/7, doorstep service"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition text-xs"
              >
                {editingId ? 'Update Contact' : 'Save Contact'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Contacts List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Active Directory ({contacts.length})</h3>
              <span className="text-xs text-slate-400">All residents can click to call directly</span>
            </div>

            {contacts.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Phone className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No emergency contacts added yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Use the form on the left to add your first helpline.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {contacts.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                    <div className="flex items-start space-x-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0 mt-0.5">
                        {getTypeIcon(c.contactType)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {c.contactType}
                          </span>
                        </div>
                        <div className="text-xs font-mono font-semibold text-indigo-700 mt-0.5">
                          {c.phone}
                        </div>
                        {c.description && (
                          <div className="text-[11px] text-slate-500 mt-1">{c.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <a
                        href={`tel:${c.phone.replace(/\s+/g, '')}`}
                        className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="Test Call"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
