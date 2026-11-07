import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Sparkles, X, Calendar, MapPin } from 'lucide-react';

export default function PopupNoticeModal() {
  const [popups, setPopups] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      const res = await api.get('/events/popups');
      if (res.data && res.data.length > 0) {
        setPopups(res.data);
        const dismissed = sessionStorage.getItem('snns_dismissed_popups');
        if (!dismissed) {
          setIsOpen(true);
        }
      }
    } catch (e) {
      console.error('Failed to load popups', e);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('snns_dismissed_popups', 'true');
  };

  if (!isOpen || popups.length === 0) return null;

  const current = popups[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-brand-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse" />
            <h3 className="text-lg font-bold">Community Announcement</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">{current.title}</h2>
          
          <div className="flex flex-wrap gap-3 my-3 text-xs font-medium text-slate-600">
            <span className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>{new Date(current.eventDate).toLocaleDateString()} at {new Date(current.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
            {current.venue && (
              <span className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-md">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>{current.venue}</span>
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mt-3 whitespace-pre-line">
            {current.description}
          </p>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
