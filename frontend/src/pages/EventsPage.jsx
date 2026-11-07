import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Calendar, Plus, MapPin, Sparkles, Trash2, Clock, Edit3, AlertCircle } from 'lucide-react';

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
      setEvents(res.data);
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

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('eventDate', eventDate);
      formData.append('venue', venue);
      formData.append('isPopupNotice', isPopupNotice);
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

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
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (e) {
      alert('Failed to delete event: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Events, Cultural Fests & Circulars</h2>
          <p className="text-sm text-slate-500">
            Onam celebrations, cultural festivals, and resident announcements.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publish New Event</span>
          </button>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No events scheduled at the moment.</p>
            {isAdmin && (
              <p className="text-xs text-slate-400 mt-1">Click the button above to publish an event or circular.</p>
            )}
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                {evt.bannerImagePath ? (
                  <img
                    src={`/api/files/${evt.bannerImagePath}`}
                    alt={evt.title}
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  <div className="w-full h-28 bg-gradient-to-br from-brand-600 to-indigo-700 p-4 flex items-end">
                    <span className="text-white/80 font-bold text-xs tracking-wider uppercase flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Community Notice</span>
                    </span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-brand-700 font-semibold mb-2">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {evt.eventDate
                          ? new Date(evt.eventDate).toLocaleDateString([], {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'TBA'}
                      </span>
                    </div>
                    {evt.isPopupNotice && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">
                        Pop-up Alert
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug mb-2">{evt.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">{evt.description}</p>

                  <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.venue || 'SNNS Community Hall'}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => openEditModal(evt)}
                    className="text-xs font-semibold text-slate-600 hover:text-brand-600 p-1 flex items-center space-x-1 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(evt.id)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 p-1 flex items-center space-x-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">
                {editingEvent ? 'Edit Community Event' : 'Publish Community Event or Notice'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grand Onam Cultural Fest 🌸"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide festival details, timings, and program itinerary..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Event Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. SNNS Rooftop & Community Hall"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="popupNotice"
                  checked={isPopupNotice}
                  onChange={(e) => setIsPopupNotice(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
                <label htmlFor="popupNotice" className="text-xs font-semibold text-slate-700">
                  Broadcast as Pop-Up Banner when Residents log in
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Event Banner Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
                >
                  {editingEvent ? 'Save Changes' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
