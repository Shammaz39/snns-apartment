import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import {
  DoorClosed,
  Edit3,
  Plus,
  Trash2,
  Layers,
  AlertCircle,
  CheckCircle2,
  Zap,
  Search,
  Filter,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export default function RoomsPage() {
  const [searchParams] = useSearchParams();
  const initialFloor = searchParams.get('floor') || 'ALL';

  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [floorFilter, setFloorFilter] = useState(initialFloor);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [error, setError] = useState('');

  // Single Room Form
  const [singleRoomNumber, setSingleRoomNumber] = useState('');
  const [singleFloorNumber, setSingleFloorNumber] = useState(1);
  const [singleRent, setSingleRent] = useState('');
  const [singleLiftFee, setSingleLiftFee] = useState('');
  const [singleWasteFee, setSingleWasteFee] = useState('');

  // Bulk Room Form
  const [bulkFloorNumber, setBulkFloorNumber] = useState(1);
  const [startSuffix, setStartSuffix] = useState(1);
  const [endSuffix, setEndSuffix] = useState(10);
  const [bulkRent, setBulkRent] = useState('');
  const [bulkLiftFee, setBulkLiftFee] = useState('');
  const [bulkWasteFee, setBulkWasteFee] = useState('');

  // Edit Room Form
  const [editRent, setEditRent] = useState('');
  const [editLiftFee, setEditLiftFee] = useState('');
  const [editWasteFee, setEditWasteFee] = useState('');
  const [editStatus, setEditStatus] = useState('VACANT');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsRes, floorsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/floors')
      ]);
      setRooms(roomsRes.data || []);
      setFloors(floorsRes.data || []);

      if (floorsRes.data?.length > 0) {
        setSingleFloorNumber(floorsRes.data[0].floorNumber);
        setBulkFloorNumber(floorsRes.data[0].floorNumber);
      }
    } catch (e) {
      console.error('Failed to load rooms and floors', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (room) => {
    setSelectedRoom(room);
    setEditRent(room.defaultRent);
    setEditLiftFee(room.defaultLiftFee);
    setEditWasteFee(room.defaultWasteFee);
    setEditStatus(room.status);
    setError('');
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/rooms/${selectedRoom.id}`, {
        roomNumber: selectedRoom.roomNumber,
        floorNumber: selectedRoom.floorNumber,
        defaultRent: editRent,
        defaultLiftFee: editLiftFee,
        defaultWasteFee: editWasteFee,
        status: editStatus,
      });
      setSelectedRoom(null);
      loadData();
    } catch (e) {
      alert('Failed to update room: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleCreateSingle = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/rooms', {
        roomNumber: singleRoomNumber,
        floorNumber: Number(singleFloorNumber),
        defaultRent: singleRent ? Number(singleRent) : null,
        defaultLiftFee: singleLiftFee ? Number(singleLiftFee) : null,
        defaultWasteFee: singleWasteFee ? Number(singleWasteFee) : null,
      });
      setShowSingleModal(false);
      setSingleRoomNumber('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create room');
    }
  };

  const handleCreateBulk = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/rooms/bulk', {
        floorNumber: Number(bulkFloorNumber),
        startSuffix: Number(startSuffix),
        endSuffix: Number(endSuffix),
        defaultRent: bulkRent ? Number(bulkRent) : null,
        defaultLiftFee: bulkLiftFee ? Number(bulkLiftFee) : null,
        defaultWasteFee: bulkWasteFee ? Number(bulkWasteFee) : null,
      });
      setShowBulkModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate rooms');
    }
  };

  const handleDeleteRoom = async (room) => {
    if (room.status === 'OCCUPIED') {
      alert(`Cannot delete Room ${room.roomNumber} while it is OCCUPIED. Deboard the tenant first.`);
      return;
    }
    if (!window.confirm(`Delete Room ${room.roomNumber}?`)) return;

    try {
      await api.delete(`/rooms/${room.id}`);
      loadData();
    } catch (err) {
      alert('Failed to delete room: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesFloor = floorFilter === 'ALL' || String(r.floorNumber) === String(floorFilter);
    const matchesSearch = !searchQuery || String(r.roomNumber).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFloor && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apartment Units Matrix"
        subtitle="Manage flat inventory, status tracking, monthly fee schedules, and bulk generator."
        badge={`${rooms.length} Total Units`}
        badgeIcon={DoorClosed}
        breadcrumbs={[{ label: 'Apartment Rooms' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setError(''); setShowBulkModal(true); }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-surface-secondary text-content-primary hover:bg-line-subtle border border-line-subtle rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Zap className="w-4 h-4 text-ocean-cyan" />
              <span>Bulk Room Generator</span>
            </button>
            <button
              onClick={() => { setError(''); setShowSingleModal(true); }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-ocean-cyan hover:bg-ocean-cyanHover text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Single Flat</span>
            </button>
          </div>
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
            placeholder="Search flat number (e.g. 101, 201)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-surface-secondary text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
          />
        </div>

        {/* Floor Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFloorFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              floorFilter === 'ALL'
                ? 'bg-ocean-deep text-white shadow-xs dark:bg-ocean-cyan dark:text-slate-900'
                : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary'
            }`}
          >
            All Floors ({rooms.length})
          </button>
          {floors.map((f) => (
            <button
              key={f.id}
              onClick={() => setFloorFilter(String(f.floorNumber))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                String(floorFilter) === String(f.floorNumber)
                  ? 'bg-ocean-deep text-white shadow-xs dark:bg-ocean-cyan dark:text-slate-900'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary'
              }`}
            >
              Floor {f.floorNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Room Units */}
      {loading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : filteredRooms.length === 0 ? (
        <EmptyState
          icon={DoorClosed}
          title="No Flats Match Your Criteria"
          description="Try adjusting your search query or generate new rooms using the bulk generator."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-surface-main p-5 rounded-2xl border border-line-subtle shadow-saas-card hover:shadow-saas-card-hover transition-all duration-200 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted">
                    Floor {room.floorNumber}
                  </span>
                  <h3 className="text-xl font-extrabold text-content-primary mt-0.5">
                    Room {room.roomNumber}
                  </h3>
                </div>
                <StatusBadge status={room.status} size="xs" />
              </div>

              {/* Fee Matrix Details */}
              <div className="p-3 rounded-xl bg-surface-secondary/70 border border-line-subtle space-y-1 text-xs">
                <div className="flex justify-between text-content-secondary">
                  <span>Base Rent:</span>
                  <span className="font-bold text-content-primary">₹{room.defaultRent}</span>
                </div>
                <div className="flex justify-between text-content-secondary">
                  <span>Lift + Waste:</span>
                  <span className="font-bold text-content-primary">
                    ₹{(Number(room.defaultLiftFee) + Number(room.defaultWasteFee)).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-line-subtle/60 pt-1 text-content-primary font-bold">
                  <span>Total Monthly:</span>
                  <span className="text-ocean-cyan">
                    ₹{(Number(room.defaultRent) + Number(room.defaultLiftFee) + Number(room.defaultWasteFee)).toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-line-subtle flex items-center justify-end space-x-1.5">
                <button
                  onClick={() => handleOpenEdit(room)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-content-secondary hover:text-ocean-cyan hover:bg-surface-secondary transition flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteRoom(room)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-content-secondary hover:text-red-500 hover:bg-red-500/10 transition flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Room Modal */}
      {selectedRoom && (
        <Modal
          isOpen={Boolean(selectedRoom)}
          onClose={() => setSelectedRoom(null)}
          title={`Edit Flat ${selectedRoom.roomNumber}`}
          subtitle="Adjust room fee schedule and occupancy status"
          icon={Edit3}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
                Room Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
              >
                <option value="VACANT">VACANT (Available for new tenant)</option>
                <option value="OCCUPIED">OCCUPIED (Tenant allocated)</option>
                <option value="MAINTENANCE">MAINTENANCE (Temporarily closed)</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-content-primary uppercase mb-1">Rent (₹)</label>
                <input
                  type="number"
                  required
                  value={editRent}
                  onChange={(e) => setEditRent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-content-primary uppercase mb-1">Lift (₹)</label>
                <input
                  type="number"
                  required
                  value={editLiftFee}
                  onChange={(e) => setEditLiftFee(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-content-primary uppercase mb-1">Waste (₹)</label>
                <input
                  type="number"
                  required
                  value={editWasteFee}
                  onChange={(e) => setEditWasteFee(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2.5 text-xs font-semibold text-content-secondary hover:text-content-primary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-ocean-cyan hover:bg-ocean-cyanHover rounded-xl shadow-xs"
              >
                Save Room
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Single Room Modal */}
      <Modal
        isOpen={showSingleModal}
        onClose={() => setShowSingleModal(false)}
        title="Add Single Flat"
        subtitle="Provision an individual room"
        icon={Plus}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSingle} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 text-red-600 text-xs rounded-xl">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1">Floor</label>
            <select
              value={singleFloorNumber}
              onChange={(e) => setSingleFloorNumber(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
            >
              {floors.map((f) => (
                <option key={f.id} value={f.floorNumber}>Floor {f.floorNumber} ({f.floorName})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1">Room Number</label>
            <input
              type="text"
              required
              placeholder="e.g. 101, 201, 305"
              value={singleRoomNumber}
              onChange={(e) => setSingleRoomNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
            />
          </div>

          <p className="text-[11px] text-content-muted">Leave fee fields blank to automatically inherit floor defaults.</p>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowSingleModal(false)}
              className="px-4 py-2 text-xs font-semibold text-content-secondary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-ocean-cyan hover:bg-ocean-cyanHover rounded-xl"
            >
              Create Unit
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Room Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Generator"
        subtitle="Batch generate room sequences (e.g. 101 to 110)"
        icon={Zap}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateBulk} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 text-red-600 text-xs rounded-xl">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1">Target Floor</label>
            <select
              value={bulkFloorNumber}
              onChange={(e) => setBulkFloorNumber(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
            >
              {floors.map((f) => (
                <option key={f.id} value={f.floorNumber}>Floor {f.floorNumber} ({f.floorName})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1">Start Suffix</label>
              <input
                type="number"
                min="1"
                required
                value={startSuffix}
                onChange={(e) => setStartSuffix(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
              />
              <span className="text-[10px] text-content-muted">e.g. 1 creates {bulkFloorNumber}01</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1">End Suffix</label>
              <input
                type="number"
                min="1"
                required
                value={endSuffix}
                onChange={(e) => setEndSuffix(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl"
              />
              <span className="text-[10px] text-content-muted">e.g. 10 creates {bulkFloorNumber}10</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowBulkModal(false)}
              className="px-4 py-2 text-xs font-semibold text-content-secondary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-ocean-cyan hover:bg-ocean-cyanHover rounded-xl"
            >
              Generate Flats
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
