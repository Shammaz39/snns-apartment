import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Sparkles, X, Calendar, MapPin, Bell } from 'lucide-react';
import Modal from './common/Modal';

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Community Announcement"
      subtitle="Important bulletin for all residents"
      icon={Sparkles}
      maxWidth="max-w-lg"
      footer={
        <button
          onClick={handleClose}
          className="px-5 py-2.5 bg-ocean-cyan hover:bg-ocean-cyanHover text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          Understood, Dismiss
        </button>
      }
    >
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-content-primary">{current.title}</h2>

        <div className="flex flex-wrap gap-2 text-xs font-medium text-content-secondary">
          <span className="flex items-center space-x-1.5 bg-surface-secondary px-3 py-1.5 rounded-xl border border-line-subtle">
            <Calendar className="w-3.5 h-3.5 text-ocean-cyan" />
            <span>
              {new Date(current.eventDate).toLocaleDateString()} at{' '}
              {new Date(current.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </span>

          {current.venue && (
            <span className="flex items-center space-x-1.5 bg-surface-secondary px-3 py-1.5 rounded-xl border border-line-subtle">
              <MapPin className="w-3.5 h-3.5 text-ocean-violet" />
              <span>{current.venue}</span>
            </span>
          )}
        </div>

        <p className="text-sm text-content-secondary leading-relaxed pt-2 whitespace-pre-line border-t border-line-subtle/50">
          {current.description}
        </p>
      </div>
    </Modal>
  );
}
