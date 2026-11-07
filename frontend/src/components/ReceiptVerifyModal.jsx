import React, { useState } from 'react';
import { CheckCircle, XCircle, ExternalLink, Receipt, Clock } from 'lucide-react';
import api from '../api/client';
import Modal from './common/Modal';
import StatusBadge from './common/StatusBadge';

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
    <Modal
      isOpen={Boolean(bill)}
      onClose={onClose}
      title={`Verify Payment — Flat ${bill.room?.roomNumber || ''}`}
      subtitle="Examine uploaded bank proof & approve or reject"
      icon={Receipt}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => handleAction(false)}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold transition disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Payment</span>
          </button>
          <button
            type="button"
            onClick={() => handleAction(true)}
            disabled={loading}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-ocean-cyan hover:bg-ocean-cyanHover text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve & Mark Paid</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Bill summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface-secondary p-3 rounded-xl border border-line-subtle">
            <span className="text-[10px] uppercase font-bold text-content-muted">Month</span>
            <p className="text-sm font-bold text-content-primary">{bill.billingMonth}</p>
          </div>
          <div className="bg-surface-secondary p-3 rounded-xl border border-line-subtle">
            <span className="text-[10px] uppercase font-bold text-content-muted">Base Rent</span>
            <p className="text-sm font-bold text-content-primary">₹{Number(bill.rentAmount).toLocaleString()}</p>
          </div>
          <div className="bg-surface-secondary p-3 rounded-xl border border-line-subtle">
            <span className="text-[10px] uppercase font-bold text-content-muted">Lift + Waste</span>
            <p className="text-sm font-bold text-content-primary">
              ₹{(Number(bill.liftMaintenanceFee) + Number(bill.wasteManagementFee)).toFixed(2)}
            </p>
          </div>
          <div className="bg-ocean-cyan/10 p-3 rounded-xl border border-ocean-cyan/30">
            <span className="text-[10px] uppercase font-bold text-ocean-cyan">Total Billed</span>
            <p className="text-sm font-extrabold text-ocean-cyan">₹{Number(bill.totalAmount).toLocaleString()}</p>
          </div>
        </div>

        {/* Transaction Reference (UTR) */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Submitted Bank Reference / UTR Number:
            </span>
            <p className="text-base font-mono font-bold text-content-primary mt-0.5">
              {bill.transactionRef || 'N/A'}
            </p>
          </div>
          <StatusBadge status="PENDING_VERIFICATION" />
        </div>

        {/* Receipt Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-content-primary uppercase tracking-wider">
              Payment Screenshot / Bank Receipt:
            </label>
            {receiptUrl && (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-ocean-cyan hover:underline flex items-center space-x-1"
              >
                <span>Open Original File</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <div className="border border-line-subtle rounded-2xl overflow-hidden bg-surface-secondary flex items-center justify-center min-h-[200px] max-h-[320px]">
            {receiptUrl ? (
              <img
                src={receiptUrl}
                alt="Payment Receipt"
                className="object-contain max-h-[320px] w-full"
              />
            ) : (
              <span className="text-xs text-content-muted">No screenshot attached (Reference only)</span>
            )}
          </div>
        </div>

        {/* Remarks input */}
        <div>
          <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
            Admin Remarks (Optional audit note or rejection reason):
          </label>
          <input
            type="text"
            placeholder="e.g. Verified via Bank statement, or 'UTR mismatch'"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:border-ocean-cyan focus:outline-none transition"
          />
        </div>
      </div>
    </Modal>
  );
}
