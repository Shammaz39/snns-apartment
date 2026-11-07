import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Receipt, PlusCircle, CheckCircle2, Clock, XCircle, Filter, FileText } from 'lucide-react';
import ReceiptVerifyModal from '../components/ReceiptVerifyModal';

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedBillForVerify, setSelectedBillForVerify] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bill Generation form state
  const [targetRoomId, setTargetRoomId] = useState(''); // empty for all
  const [billingMonth, setBillingMonth] = useState('2026-10');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [billsRes, roomsRes] = await Promise.all([
        api.get('/bills'),
        api.get('/rooms')
      ]);
      setBills(billsRes.data);
      setRooms(roomsRes.data);
    } catch (e) {
      console.error('Failed to load bills', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBills = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bills/generate', {
        roomId: targetRoomId ? Number(targetRoomId) : null,
        billingMonth: billingMonth,
      });
      alert('Bills generated successfully!');
      setShowGenerateModal(false);
      loadData();
    } catch (e) {
      alert('Failed to generate bills: ' + (e.response?.data?.message || e.message));
    }
  };

  const filteredBills = bills.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Billing & Payment Verification</h2>
          <p className="text-sm text-slate-500">
            Generate lift maintenance, waste management, and rent bills. Review UPI payment receipts.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Generate Monthly Bills</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold max-w-fit">
        {[
          { key: 'ALL', label: 'All Bills' },
          { key: 'PENDING_VERIFICATION', label: 'Awaiting Verification' },
          { key: 'PAID', label: 'Paid & Approved' },
          { key: 'PENDING', label: 'Unpaid / Pending' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              statusFilter === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Month</th>
                <th className="px-5 py-3.5">Room</th>
                <th className="px-5 py-3.5">Fee Breakdown</th>
                <th className="px-5 py-3.5">Total Amount</th>
                <th className="px-5 py-3.5">Payment Status</th>
                <th className="px-5 py-3.5">Transaction UTR</th>
                <th className="px-5 py-3.5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">
                    No bills found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">{b.billingMonth}</td>
                    <td className="px-5 py-4 font-bold text-slate-800">Room #{b.room?.roomNumber}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      <div>Rent: ₹{b.rentAmount}</div>
                      <div>Lift: ₹{b.liftMaintenanceFee} | Waste: ₹{b.wasteManagementFee}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">₹{b.totalAmount}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full font-bold ${
                          b.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'PENDING_VERIFICATION'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : b.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.status === 'PAID' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {b.status === 'PENDING_VERIFICATION' && <Clock className="w-3.5 h-3.5" />}
                        {b.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                        <span>{b.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-700">
                      {b.transactionRef || '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {b.status === 'PENDING_VERIFICATION' ? (
                        <button
                          onClick={() => setSelectedBillForVerify(b)}
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                        >
                          Verify Receipt
                        </button>
                      ) : b.receiptDocPath ? (
                        <button
                          onClick={() => setSelectedBillForVerify(b)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition"
                        >
                          View Receipt
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">No receipt</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Bills Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Generate Monthly Maintenance Bills</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateBills} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Billing Month</label>
                <input
                  type="text"
                  required
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  placeholder="YYYY-MM (e.g. 2026-10)"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Scope</label>
                <select
                  value={targetRoomId}
                  onChange={(e) => setTargetRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Occupied Rooms (Automatic)</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room #{r.roomNumber} ({r.status})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave as "All Occupied Rooms" to generate bills across the entire apartment complex.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Generate Bills
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Verifying Payment */}
      {selectedBillForVerify && (
        <ReceiptVerifyModal
          bill={selectedBillForVerify}
          onClose={() => setSelectedBillForVerify(null)}
          onVerified={loadData}
        />
      )}
    </div>
  );
}
