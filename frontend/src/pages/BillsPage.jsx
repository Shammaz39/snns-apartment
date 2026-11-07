import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Receipt,
  PlusCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import ReceiptVerifyModal from '../components/ReceiptVerifyModal';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
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
      setBills(billsRes.data || []);
      setRooms(roomsRes.data || []);
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
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      b.room?.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.transactionRef?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Payment Audit"
        subtitle="Generate monthly maintenance fee invoices, review UTR screenshots, and mark payments verified."
        badge={`${bills.length} Invoices`}
        badgeIcon={Receipt}
        breadcrumbs={[{ label: 'Billing & Receipts' }]}
        actions={
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-ocean-cyan hover:bg-ocean-cyanHover text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Generate Monthly Bills</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-main p-3 rounded-2xl border border-line-subtle shadow-saas-card">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search flat # or UTR reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-surface-secondary text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
          />
        </div>

        {/* Filter Status Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'All Invoices' },
            { key: 'PENDING_VERIFICATION', label: 'Queued for Audit' },
            { key: 'PAID', label: 'Paid & Approved' },
            { key: 'PENDING', label: 'Awaiting Payment' },
            { key: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.key
                  ? 'bg-ocean-deep text-white shadow-xs dark:bg-ocean-cyan dark:text-slate-900'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bills Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : filteredBills.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Invoices Found"
          description="Click '+ Generate Monthly Bills' above to run the automated billing cycle."
        />
      ) : (
        <div className="bg-surface-main rounded-3xl border border-line-subtle shadow-saas-card overflow-hidden">
          <div className="table-container">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line-subtle text-content-muted uppercase font-bold text-[10px] bg-surface-secondary/40">
                  <th className="py-3.5 px-4">Invoice / Flat</th>
                  <th className="py-3.5 px-4">Billing Month</th>
                  <th className="py-3.5 px-4">Breakdown</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Bank Ref (UTR)</th>
                  <th className="py-3.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle">
                {filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-secondary/50 transition">
                    <td className="py-3.5 px-4 font-bold text-content-primary">
                      <span className="font-mono text-ocean-cyan">#{b.id}</span> • Flat {b.room?.roomNumber}
                    </td>
                    <td className="py-3.5 px-4 text-content-secondary font-medium">
                      {b.billingMonth}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-content-muted">
                      Rent: ₹{b.rentAmount} | Lift: ₹{b.liftMaintenanceFee} | Waste: ₹{b.wasteManagementFee}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-content-primary text-sm">
                      ₹{Number(b.totalAmount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-content-secondary">
                      {b.transactionRef || <span className="text-content-muted italic">None</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {b.status === 'PENDING_VERIFICATION' ? (
                        <button
                          onClick={() => setSelectedBillForVerify(b)}
                          className="px-3.5 py-1.5 bg-ocean-cyan hover:bg-ocean-cyanHover text-white font-bold rounded-xl text-xs shadow-xs transition"
                        >
                          Verify Receipt
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedBillForVerify(b)}
                          className="px-3 py-1.5 text-content-secondary hover:text-content-primary hover:bg-surface-secondary font-medium rounded-xl text-xs transition"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bill Generation Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Monthly Invoices"
        subtitle="Automated batch calculation of rent, lift, and waste fees"
        icon={Receipt}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleGenerateBills} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
              Target Selection
            </label>
            <select
              value={targetRoomId}
              onChange={(e) => setTargetRoomId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
            >
              <option value="">All Occupied Units (Society Bulk Generation)</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Flat {r.roomNumber} ({r.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
              Billing Month (YYYY-MM)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2026-11"
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none font-mono"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowGenerateModal(false)}
              className="px-4 py-2 text-xs font-semibold text-content-secondary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-ocean-cyan hover:bg-ocean-cyanHover rounded-xl shadow-xs"
            >
              Run Generation
            </button>
          </div>
        </form>
      </Modal>

      {/* Verification Modal */}
      {selectedBillForVerify && (
        <ReceiptVerifyModal
          bill={selectedBillForVerify}
          onClose={() => setSelectedBillForVerify(null)}
          onSuccess={() => {
            setSelectedBillForVerify(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
