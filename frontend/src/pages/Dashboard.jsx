import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Link } from 'react-router-dom';
import {
  DoorClosed,
  Users,
  CheckCircle2,
  Clock,
  IndianRupee,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Wrench,
  Sparkles
} from 'lucide-react';
import ReceiptVerifyModal from '../components/ReceiptVerifyModal';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [floors, setFloors] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, floorsRes] = await Promise.all([
        api.get('/bills/stats'),
        api.get('/bills/pending-verifications'),
        api.get('/floors')
      ]);
      setStats(statsRes.data);
      setPendingBills(pendingRes.data);
      setFloors(floorsRes.data);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-brand-500/20 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enterprise Property Control Tower</span>
          </div>
          <h2 className="text-2xl font-bold">SNNS Apartment Management</h2>
          <p className="text-slate-300 text-sm mt-1">
            Managing {stats?.totalRooms || 0} residential units across {floors.length} configured floors with live gate security & billing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/bills"
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Generate Monthly Bills
          </Link>
          <Link
            to="/tenants"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition"
          >
            + Onboard Tenant
          </Link>
          <Link
            to="/floors"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition"
          >
            Manage Floors
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Units</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">{stats?.totalRooms || 0}</span>
              <span className="text-xs text-brand-700 font-medium">({stats?.occupiedRooms || 0} Occupied)</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">{stats?.vacantRooms || 0} Vacant units</span>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <DoorClosed className="w-6 h-6" />
          </div>
        </div>

        {/* Configured Floors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configured Floors</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">{floors.length}</span>
              <span className="text-xs text-slate-400 font-medium">Floors</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Scalable to 300+ units</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Total Collected Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collected Revenue</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">
                ₹{Number(stats?.totalPaidRevenue || 0).toLocaleString()}
              </span>
            </div>
            <span className="text-xs text-emerald-600 font-medium mt-1 block">Verified & Approved</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending UTR Queue</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-extrabold text-amber-600">{stats?.pendingVerificationsCount || 0}</span>
              <span className="text-xs text-amber-700 font-medium">Receipts</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              ₹{Number(stats?.totalPendingRevenue || 0).toLocaleString()} pending
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Receipts + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Verification Receipts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Pending Payment Receipts</h3>
              <p className="text-xs text-slate-500">Tenants uploaded UTR receipts awaiting bank verification</p>
            </div>
            <Link to="/bills" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
              <span>View All Bills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingBills.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-400">No payment proofs currently waiting for admin verification.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                    <th className="pb-3">Room</th>
                    <th className="pb-3">Month</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Transaction UTR</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 font-bold text-slate-800">Room {bill.room?.roomNumber}</td>
                      <td className="py-3.5 text-slate-600">{bill.billingMonth}</td>
                      <td className="py-3.5 font-bold text-slate-900">₹{Number(bill.totalAmount).toLocaleString()}</td>
                      <td className="py-3.5 font-mono text-slate-500">{bill.transactionRef || 'N/A'}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg transition"
                        >
                          Verify Proof
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Operations Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-3">Quick Operations</h3>
            <div className="space-y-2">
              <Link
                to="/floors"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Floor Configuration</span>
                    <span className="text-[11px] text-slate-400">Add floors & default fee rates</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
              </Link>

              <Link
                to="/staff"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Staff & Security Guards</span>
                    <span className="text-[11px] text-slate-400">Create security & admin accounts</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
              </Link>

              <Link
                to="/gate"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Gatekeeper Terminal</span>
                    <span className="text-[11px] text-slate-400">Visitor check-in & vehicle logging</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {selectedBill && (
        <ReceiptVerifyModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
          onSuccess={() => {
            setSelectedBill(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
