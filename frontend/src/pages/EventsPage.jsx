import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Plus,
  MapPin,
  Sparkles,
  Trash2,
  Clock,
  Edit3,
  AlertCircle,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

export default function EventsPage() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('SNNS Community Hall');
  const [isPopupNotice, setIsPopupNotice] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      setEvents(res.data || []);
    } catch (e) {
      console.error('Failed to load events', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setEventDate('');
    setVenue('SNNS Community Hall');
    setIsPopupNotice(false);
    setBannerFile(null);
    setError('');
    setShowCreateModal(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setEventDate(event.eventDate ? event.eventDate.substring(0, 16) : '');
    setVenue(event.venue || 'SNNS Community Hall');
    setIsPopupNotice(event.isPopupNotice || false);
    setBannerFile(null);
    setError('');
    setShowCreateModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('eventDate', eventDate ? new Date(eventDate).toISOString() : new Date().toISOString());
      formData.append('venue', venue);
      formData.append('isPopupNotice', isPopupNotice);
      if (bannerFile) formData.append('banner', bannerFile);

      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/events', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowCreateModal(false);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save event');
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete announcement "${event.title}"?`)) return;
    try {
      await api.delete(`/events/${event.id}`);
      fetchEvents();
    } catch (err) {
      alert('Failed to delete event: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Community Announcements & Events"
        subtitle="Broadcast official society circulars, festival notices, and emergency alerts to resident portals."
        badge={`${events.length} Notices`}
        badgeIcon={Calendar}
        breadcrumbs={[{ label: 'Events & Notices' }]}
        actions={
          isAdmin && (
            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-4 py-2.5 bg-ocean-cyan hover:bg-ocean-cyanHover text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Post Announcement</span>
            </button>
          )
        }
      />

      {loading ? (
        <CardSkeleton count={3} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Active Announcements"
          description="There are no active community events or circular notices published right now."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-surface-main rounded-3xl border border-line-subtle shadow-saas-card hover:shadow-saas-card-hover transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Optional Banner Image */}
                {ev.bannerDocPath ? (
                  <div className="h-40 w-full overflow-hidden bg-surface-secondary">
                    <img
                      src={`/api/files/${ev.bannerDocPath}`}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-2.5 bg-gradient-to-r from-ocean-deep via-ocean-cyan to-ocean-violet w-full"></div>
                )}

                <div className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-content-primary leading-tight">
                      {ev.title}
                    </h3>
                    {ev.isPopupNotice && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                        <Sparkles className="w-3 h-3" />
                        <span>Popup</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-content-secondary">
                    <p className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-ocean-cyan shrink-0" />
                      <span>{new Date(ev.eventDate).toLocaleDateString()} at {new Date(ev.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                    {ev.venue && (
                      <p className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-ocean-violet shrink-0" />
                        <span>{ev.venue}</span>
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-content-secondary leading-relaxed pt-2 border-t border-line-subtle/50 line-clamp-4 whitespace-pre-line">
                    {ev.description}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="px-6 py-3 border-t border-line-subtle bg-surface-secondary/40 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => openEditModal(ev)}
                    className="p-1.5 rounded-lg text-content-muted hover:text-ocean-cyan hover:bg-surface-secondary transition"
                    title="Edit announcement"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ev)}
                    className="p-1.5 rounded-lg text-content-muted hover:text-red-500 hover:bg-red-500/10 transition"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingEvent ? 'Edit Community Announcement' : 'Post Community Circular'}
        subtitle="Publish alerts and event notices across all resident portals"
        icon={Calendar}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 text-red-600 text-xs rounded-xl">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase mb-1">Announcement Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual General Body Meeting (AGM) 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-content-primary uppercase mb-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-content-primary uppercase mb-1">Venue</label>
              <input
                type="text"
                placeholder="SNNS Community Hall"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase mb-1">Notice Description</label>
            <textarea
              rows={4}
              required
              placeholder="Enter announcement details, agenda items, or circular instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl resize-none"
            />
          </div>

          <div className="p-3 rounded-2xl bg-surface-secondary/70 border border-line-subtle flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-content-primary block">Display as Popup Modal</span>
              <span className="text-[11px] text-content-muted">Shows an alert dialog immediately when residents log in</span>
            </div>
            <input
              type="checkbox"
              checked={isPopupNotice}
              onChange={(e) => setIsPopupNotice(e.target.checked)}
              className="w-4 h-4 rounded text-ocean-cyan focus:ring-ocean-cyan"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase mb-1">Banner Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files[0])}
              className="text-xs text-content-secondary file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-ocean-cyan/10 file:text-ocean-cyan cursor-pointer"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-xs font-semibold text-content-secondary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-ocean-cyan hover:bg-ocean-cyanHover rounded-xl shadow-xs"
            >
              {editingEvent ? 'Update Notice' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
