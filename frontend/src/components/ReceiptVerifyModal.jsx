import React, { useState } from 'react';
import { X, CheckCircle, XCircle, ExternalLink, Receipt, Clock } from 'lucide-react';
import api from '../api/client';

export default function ReceiptVerifyModal({ bill, onClose, onVerified, onSuccess }) {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  if (!bill) return null;

  const handleAction = async (approved) => {
    setLoading(true);
    try {
      await api.post(`/bills/${bill.id}/verify`, {
        approved,
        remarks: remarks || (approved ? 'Payment verified successfully' : 'Payment rejected by Admin')
      });
      if (onVerified) onVerified();
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      alert('Failed to process verification: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const receiptUrl = bill.receiptDocPath ? `/api/files/${bill.receiptDocPath}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Verify Payment — Room {bill.room?.roomNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Bill summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Month</span>
              <p className="text-sm font-bold text-slate-900">{bill.billingMonth}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Rent</span>
              <p className="text-sm font-bold text-slate-900">₹{bill.rentAmount}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Lift + Waste</span>
              <p className="text-sm font-bold text-slate-900">
                ₹{(Number(bill.liftMaintenanceFee) + Number(bill.wasteManagementFee)).toFixed(2)}
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-700 font-medium">Total Billed</span>
              <p className="text-sm font-bold text-emerald-800">₹{bill.totalAmount}</p>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                Submitted Transaction Reference (UTR):
              </span>
              <p className="text-base font-mono font-bold text-amber-950 mt-0.5">
                {bill.transactionRef || 'N/A'}
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-200 text-amber-900 rounded-lg flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Awaiting Approval</span>
            </span>
          </div>

          {/* Receipt Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Uploaded Payment Screenshot:
              </label>
              {receiptUrl && (
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                >
                  <span>Open Full Image</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center min-h-[220px] max-h-[350px]">
              {receiptUrl ? (
                <img
                  src={receiptUrl}
                  alt="Payment Receipt"
                  className="object-contain max-h-[350px] w-full"
                />
              ) : (
                <span className="text-sm text-slate-400">No screenshot attached (Reference only)</span>
              )}
            </div>
          </div>

          {/* Remarks input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Admin Remarks (Optional / Rejection reason):
            </label>
            <input
              type="text"
              placeholder="e.g. Verified via Axis Bank statement, or 'Amount incomplete'"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => handleAction(false)}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold transition"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Payment</span>
          </button>
          <button
            type="button"
            onClick={() => handleAction(true)}
            disabled={loading}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve & Mark Paid</span>
          </button>
        </div>
      </div>
    </div>
  );
}
