import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { DoorClosed, Edit3, Plus, Trash2, Layers, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

export default function RoomsPage() {
  const [searchParams] = useSearchParams();
  const initialFloor = searchParams.get('floor') || 'ALL';

  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [floorFilter, setFloorFilter] = useState(initialFloor);
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
      setRooms(roomsRes.data);
      setFloors(floorsRes.data);

      if (floorsRes.data.length > 0) {
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
        status: 'VACANT'
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
        startRoomSuffix: Number(startSuffix),
        endRoomSuffix: Number(endSuffix),
        defaultRent: bulkRent ? Number(bulkRent) : null,
        defaultLiftFee: bulkLiftFee ? Number(bulkLiftFee) : null,
        defaultWasteFee: bulkWasteFee ? Number(bulkWasteFee) : null,
      });
      setShowBulkModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to bulk-create rooms');
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Are you sure you want to delete Room ${room.roomNumber}?`)) {
      return;
    }
    try {
      await api.delete(`/rooms/${room.id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete room');
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (floorFilter === 'ALL') return true;
    return r.floorNumber === Number(floorFilter);
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <DoorClosed className="w-6 h-6 text-brand-600" />
            <span>Apartment Rooms Matrix ({rooms.length} Units)</span>
          </h2>
          <p className="text-sm text-slate-500">
            Create and scale rooms, adjust rental rates, and track live occupancy.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => { setError(''); setShowSingleModal(true); }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Room</span>
          </button>
          <button
            onClick={() => { setError(''); setShowBulkModal(true); }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Bulk Generate</span>
          </button>
        </div>
      </div>

      {/* Dynamic Floor Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setFloorFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg transition ${
            floorFilter === 'ALL'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Floors ({rooms.length})
        </button>
        {floors.map((f) => {
          const count = rooms.filter((r) => r.floorNumber === f.floorNumber).length;
          return (
            <button
              key={f.floorNumber}
              onClick={() => setFloorFilter(String(f.floorNumber))}
              className={`px-3 py-1.5 rounded-lg transition ${
                floorFilter === String(f.floorNumber)
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Floor {f.floorNumber} ({count})
            </button>
          );
        })}
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm">
          <DoorClosed className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h3 className="text-base font-bold text-slate-700">No Rooms Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            No rooms have been added for this filter. Use the "+ Add Room" or "⚡ Bulk Generate" buttons above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredRooms.map((room) => {
            const isOccupied = room.status === 'OCCUPIED';
            const isMaintenance = room.status === 'MAINTENANCE';

            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-extrabold text-slate-900">
                      Room {room.roomNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isOccupied
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isMaintenance
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 block mb-3">Floor {room.floorNumber}</span>

                  <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rent:</span>
                      <span className="font-semibold text-slate-800">₹{Number(room.defaultRent).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lift:</span>
                      <span className="font-medium text-slate-700">₹{Number(room.defaultLiftFee).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Waste:</span>
                      <span className="font-medium text-slate-700">₹{Number(room.defaultWasteFee).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteRoom(room)}
                    className="text-xs font-semibold text-slate-400 hover:text-red-600 p-1"
                    title="Delete Room"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Single Room Modal */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">+ Add Single Room</h3>
              <button onClick={() => setShowSingleModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSingle} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    required
                    value={singleRoomNumber}
                    onChange={(e) => setSingleRoomNumber(e.target.value)}
                    placeholder="e.g. 101"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Floor
                  </label>
                  <select
                    value={singleFloorNumber}
                    onChange={(e) => setSingleFloorNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {floors.map((f) => (
                      <option key={f.floorNumber} value={f.floorNumber}>
                        Floor {f.floorNumber} ({f.floorName})
                      </option>
                    ))}
                    {floors.length === 0 && <option value="1">Floor 1</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Default Rent (₹) (Leave empty to use floor default)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={singleRent}
                  onChange={(e) => setSingleRent(e.target.value)}
                  placeholder="Inherit floor default"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSingleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">⚡ Bulk Generate Rooms</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateBulk} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Floor
                </label>
                <select
                  value={bulkFloorNumber}
                  onChange={(e) => setBulkFloorNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {floors.map((f) => (
                    <option key={f.floorNumber} value={f.floorNumber}>
                      Floor {f.floorNumber} ({f.floorName})
                    </option>
                  ))}
                  {floors.length === 0 && <option value="1">Floor 1</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Suffix (e.g. 1)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={startSuffix}
                    onChange={(e) => setStartSuffix(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Generates {bulkFloorNumber}01</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Suffix (e.g. 10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={endSuffix}
                    onChange={(e) => setEndSuffix(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Generates {bulkFloorNumber}10</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
                >
                  Generate Rooms
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">
                Configure Room {selectedRoom.roomNumber}
              </h3>
              <button onClick={() => setSelectedRoom(null)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Monthly Base Rent (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editRent}
                  onChange={(e) => setEditRent(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lift Fee (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editLiftFee}
                    onChange={(e) => setEditLiftFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Waste Fee (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editWasteFee}
                    onChange={(e) => setEditWasteFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Room Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="VACANT">VACANT</option>
                  <option value="OCCUPIED">OCCUPIED</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
