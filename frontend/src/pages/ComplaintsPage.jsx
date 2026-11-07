import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Wrench, CheckCircle, Clock, AlertTriangle, MessageSquare, 
  Filter, Shield, Building2, CheckCircle2, ChevronRight, Sparkles 
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export default function ComplaintsPage() {
  const { isAdmin, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [adminResponse, setAdminResponse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const url = isAdmin
        ? '/complaints'
        : user?.roomId
        ? `/complaints/room/${user.roomId}`
        : '/complaints';
      const res = await api.get(url);
      setComplaints(res.data || []);
    } catch (e) {
      console.error('Failed to load complaints', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        adminResponse: adminResponse
      });
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (e) {
      alert('Failed to update complaint: ' + (e.response?.data?.message || e.message));
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const counts = {
    all: complaints.length,
    open: complaints.filter(c => c.status === 'OPEN').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance & Tickets"
        subtitle="Track plumbing repairs, electrical work, lift maintenance, and resident service tickets."
        badge={`${complaints.length} Total Tickets`}
      />

      {/* Filter and Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-semibold text-content-light-secondary dark:text-content-dark-secondary">
          <Filter className="w-4 h-4 text-ocean-cyan" />
          <span>Filter by Status:</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-light-secondary dark:bg-surface-dark-secondary max-w-fit overflow-x-auto">
          {[
            { id: 'ALL', label: 'All', count: counts.all },
            { id: 'OPEN', label: 'Open', count: counts.open },
            { id: 'IN_PROGRESS', label: 'In Progress', count: counts.inProgress },
            { id: 'RESOLVED', label: 'Resolved', count: counts.resolved },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                statusFilter === tab.id
                  ? 'bg-surface-light dark:bg-surface-dark text-ocean-deep dark:text-ocean-cyan shadow-xs'
                  : 'text-content-light-secondary dark:text-content-dark-secondary hover:text-content-light-primary dark:hover:text-content-dark-primary'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id
                  ? 'bg-ocean-cyan/15 text-ocean-cyan'
                  : 'bg-black/5 dark:bg-white/10'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No complaints matching selected filter"
          description={
            statusFilter === 'ALL'
              ? "All maintenance operations are currently smooth with zero open issues."
              : `There are no tickets with status "${statusFilter}".`
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="group p-5 rounded-2xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark shadow-xs hover:border-ocean-cyan/40 dark:hover:border-ocean-cyan/40 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-ocean-deep/10 text-ocean-deep dark:bg-ocean-cyan/15 dark:text-ocean-cyan">
                      Unit #{c.room?.roomNumber || 'N/A'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-surface-light-secondary text-content-light-secondary dark:bg-surface-dark-secondary dark:text-content-dark-secondary border border-border-light dark:border-border-dark">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} />
                    <span className="text-[11px] text-content-light-secondary/60 dark:text-content-dark-secondary/60 ml-auto sm:ml-0">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-content-light-primary dark:text-content-dark-primary group-hover:text-ocean-cyan transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary whitespace-pre-line leading-relaxed">
                    {c.description}
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setSelectedComplaint(c);
                      setNewStatus(c.status);
                      setAdminResponse(c.adminResponse || '');
                    }}
                    className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-surface-light-secondary hover:bg-ocean-cyan/10 text-ocean-deep hover:text-ocean-cyan dark:bg-surface-dark-secondary dark:hover:bg-ocean-cyan/20 dark:text-content-dark-primary dark:hover:text-ocean-cyan border border-border-light dark:border-border-dark transition"
                  >
                    Update Status
                  </button>
                )}
              </div>

              {c.adminResponse && (
                <div className="mt-4 p-3.5 rounded-xl bg-ocean-cyan/5 border border-ocean-cyan/20 text-xs flex items-start space-x-2.5">
                  <MessageSquare className="w-4 h-4 text-ocean-cyan shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="block text-ocean-deep dark:text-ocean-cyan font-bold">
                      Management Resolution Note:
                    </strong>
                    <span className="text-content-light-primary dark:text-content-dark-primary">
                      {c.adminResponse}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Status Update Modal */}
      <Modal
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        title="Update Ticket Status"
        subtitle={`Ticket #${selectedComplaint?.id} • Room ${selectedComplaint?.room?.roomNumber}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1.5">
              Service Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none"
            >
              <option value="OPEN">OPEN (Awaiting Review)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Technician Assigned)</option>
              <option value="RESOLVED">RESOLVED (Service Completed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1.5">
              Manager Response / Remarks to Resident
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Plumber visited and replaced washer in Room 101."
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary placeholder-content-light-secondary/50 dark:placeholder-content-dark-secondary/50 focus:ring-2 focus:ring-ocean-cyan outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedComplaint(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-content-light-secondary dark:text-content-dark-secondary hover:bg-surface-light-secondary dark:hover:bg-surface-dark-secondary border border-border-light dark:border-border-dark transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-ocean-cyan hover:bg-ocean-cyan/90 text-white shadow-xs transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
