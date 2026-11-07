import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Wrench, CheckCircle, Clock, AlertTriangle, MessageSquare } from 'lucide-react';

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
      setComplaints(res.data);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Maintenance & Service Complaints</h2>
          <p className="text-sm text-slate-500">
            Plumbing leaks, electrical repairs, lift servicing, and waste disposal tickets.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold max-w-fit">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === s
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3.5">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
            <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-2" />
            <p className="font-semibold text-slate-700">No complaints matching the selected filter!</p>
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">Room #{c.room?.roomNumber}</span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                      {c.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        c.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{c.title}</h3>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
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
                    className="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 rounded-lg text-xs font-bold border border-slate-200 transition"
                  >
                    Update Status
                  </button>
                )}
              </div>

              {c.adminResponse && (
                <div className="mt-3.5 p-3 bg-brand-50/70 border border-brand-100 rounded-xl text-xs text-brand-900 flex items-start space-x-2">
                  <MessageSquare className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-brand-950 font-bold">Admin Resolution Note:</strong>
                    <span>{c.adminResponse}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Admin Status Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Update Ticket Status</h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Technician Assigned)</option>
                  <option value="RESOLVED">RESOLVED (Work Completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Manager Response / Remarks to Resident
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Plumber visited and replaced washer in Room 101."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
