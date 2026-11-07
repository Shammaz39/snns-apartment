import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  Phone, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, 
  Wrench, Zap, ShoppingCart, ShieldAlert, HeartPulse, Flame, PhoneCall,
  Sparkles, HelpCircle
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

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
      case 'PLUMBER': return <Wrench className="w-4 h-4 text-ocean-cyan" />;
      case 'ELECTRICIAN': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'SUPERMARKET': return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
      case 'HOSPITAL': return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'POLICE': return <ShieldAlert className="w-4 h-4 text-ocean-violet" />;
      case 'FIRE': return <Flame className="w-4 h-4 text-orange-500" />;
      default: return <Phone className="w-4 h-4 text-content-light-secondary dark:text-content-dark-secondary" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency & Utility Helplines"
        subtitle="Publish contact numbers for plumbers, electricians, grocery delivery, and community emergency response."
        badge={`${contacts.length} Directory Numbers`}
      />

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="p-5 rounded-2xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark shadow-xs h-fit">
          <h3 className="text-base font-bold text-content-light-primary dark:text-content-dark-primary mb-1 flex items-center space-x-2">
            <Plus className="w-4 h-4 text-ocean-cyan" />
            <span>{editingId ? 'Edit Directory Helpline' : 'Add New Helpline'}</span>
          </h3>
          <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary mb-4">
            {editingId ? 'Update details of this service contact.' : 'Publish a service provider number for apartment residents.'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-content-light-secondary dark:text-content-dark-secondary uppercase tracking-wider mb-1">
                Service Category
              </label>
              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none"
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
              <label className="block font-bold text-content-light-secondary dark:text-content-dark-secondary uppercase tracking-wider mb-1">
                Contact / Provider Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Plumbing Services"
                className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary placeholder-content-light-secondary/50 dark:placeholder-content-dark-secondary/50 focus:ring-2 focus:ring-ocean-cyan outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-content-light-secondary dark:text-content-dark-secondary uppercase tracking-wider mb-1">
                Phone Number (Click-to-Call)
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9845012345"
                className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary placeholder-content-light-secondary/50 dark:placeholder-content-dark-secondary/50 focus:ring-2 focus:ring-ocean-cyan outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-content-light-secondary dark:text-content-dark-secondary uppercase tracking-wider mb-1">
                Description / Timings (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Available 24/7, doorstep service"
                className="w-full px-3 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary placeholder-content-light-secondary/50 dark:placeholder-content-dark-secondary/50 focus:ring-2 focus:ring-ocean-cyan outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-ocean-cyan hover:bg-ocean-cyan/90 text-white font-bold rounded-xl shadow-xs transition text-xs"
              >
                {editingId ? 'Update Contact' : 'Save Contact'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2.5 px-3 rounded-xl bg-surface-light-secondary hover:bg-black/5 dark:bg-surface-dark-secondary dark:hover:bg-white/10 text-content-light-secondary dark:text-content-dark-secondary font-bold transition text-xs border border-border-light dark:border-border-dark"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Contacts List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="rounded-2xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <h3 className="font-bold text-content-light-primary dark:text-content-dark-primary text-sm">
                Active Directory ({contacts.length})
              </h3>
              <span className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
                Residents can click to call directly
              </span>
            </div>

            {loading ? (
              <div className="p-4">
                <CardSkeleton count={3} />
              </div>
            ) : contacts.length === 0 ? (
              <EmptyState
                icon={Phone}
                title="No emergency contacts added yet"
                description="Use the form on the left to add your first community helpline or contractor."
              />
            ) : (
              <div className="divide-y divide-border-light dark:divide-border-dark">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-surface-light-secondary/50 dark:hover:bg-surface-dark-secondary/50 transition"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2.5 rounded-xl bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark shrink-0 mt-0.5">
                        {getTypeIcon(c.contactType)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-content-light-primary dark:text-content-dark-primary text-sm">
                            {c.name}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-ocean-deep/10 text-ocean-deep dark:bg-ocean-cyan/15 dark:text-ocean-cyan">
                            {c.contactType}
                          </span>
                        </div>
                        <div className="text-xs font-mono font-semibold text-ocean-cyan mt-0.5">
                          {c.phone}
                        </div>
                        {c.description && (
                          <div className="text-[11px] text-content-light-secondary dark:text-content-dark-secondary mt-1">
                            {c.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <a
                        href={`tel:${c.phone.replace(/\s+/g, '')}`}
                        className="p-2 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition"
                        title="Test Call"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-2 text-content-light-secondary dark:text-content-dark-secondary hover:bg-surface-light-secondary dark:hover:bg-surface-dark-secondary rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
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
