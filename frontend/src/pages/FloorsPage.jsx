import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Layers, Plus, Edit3, Trash2, AlertCircle, Building, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FloorsPage() {
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);

  // Form states
  const [floorNumber, setFloorNumber] = useState('');
  const [floorName, setFloorName] = useState('');
  const [defaultRent, setDefaultRent] = useState(8000);
  const [defaultLiftFee, setDefaultLiftFee] = useState(500);
  const [defaultWasteFee, setDefaultWasteFee] = useState(200);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [floorsRes, roomsRes] = await Promise.all([
        api.get('/floors'),
        api.get('/rooms')
      ]);
      setFloors(floorsRes.data);
      setRooms(roomsRes.data);
    } catch (e) {
      console.error('Failed to load floors', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingFloor(null);
    setFloorNumber(floors.length + 1);
    setFloorName(`Floor ${floors.length + 1}`);
    setDefaultRent(8000);
    setDefaultLiftFee(500);
    setDefaultWasteFee(200);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (floor) => {
    setEditingFloor(floor);
    setFloorNumber(floor.floorNumber);
    setFloorName(floor.floorName);
    setDefaultRent(floor.defaultRent);
    setDefaultLiftFee(floor.defaultLiftFee);
    setDefaultWasteFee(floor.defaultWasteFee);
    setError('');
    setShowModal(true);
  };

  const handleSaveFloor = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        floorNumber: Number(floorNumber),
        floorName,
        defaultRent: Number(defaultRent),
        defaultLiftFee: Number(defaultLiftFee),
        defaultWasteFee: Number(defaultWasteFee)
      };

      if (editingFloor) {
        await api.put(`/floors/${editingFloor.id}`, payload);
      } else {
        await api.post('/floors', payload);
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleDeleteFloor = async (floor) => {
    const floorRoomCount = rooms.filter(r => r.floorNumber === floor.floorNumber).length;
    if (floorRoomCount > 0) {
      alert(`Cannot delete Floor ${floor.floorNumber} because it currently contains ${floorRoomCount} room(s). Please delete all rooms on this floor first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete Floor ${floor.floorNumber} (${floor.floorName})?`)) {
      return;
    }

    try {
      await api.delete(`/floors/${floor.id}`);
      loadData();
    } catch (err) {
      alert('Failed to delete floor: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-6 h-6 text-brand-600" />
            <span>Floor Configuration & Fee Matrix</span>
          </h2>
          <p className="text-sm text-slate-500">
            Define floors and assign floor-wide default rent, lift maintenance, and waste fees.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Floor</span>
        </button>
      </div>

      {/* Floors Grid */}
      {floors.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm">
          <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Floors Configured Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Start configuring your apartment by adding Floor 1, Floor 2, etc. Rooms can then be created on each floor.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition"
          >
            + Create First Floor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {floors.map((floor) => {
            const floorRooms = rooms.filter(r => r.floorNumber === floor.floorNumber);
            const occupiedRooms = floorRooms.filter(r => r.status === 'OCCUPIED');
            const totalMonthly = Number(floor.defaultRent || 0) + Number(floor.defaultLiftFee || 0) + Number(floor.defaultWasteFee || 0);

            return (
              <div
                key={floor.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-brand-50 text-brand-700 font-extrabold text-xs rounded-lg border border-brand-200">
                      Floor #{floor.floorNumber}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => openEditModal(floor)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Floor"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFloor(floor)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Floor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800">{floor.floorName}</h3>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Units / Rooms:</span>
                      <span className="font-bold text-slate-700">
                        {floorRooms.length} Total ({occupiedRooms.length} Occupied)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Base Total:</span>
                      <span className="font-bold text-brand-600">₹{totalMonthly.toLocaleString()}/mo</span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Default Room Rent:</span>
                      <span className="font-semibold text-slate-700">₹{Number(floor.defaultRent).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Default Lift Maintenance:</span>
                      <span className="font-semibold text-slate-700">₹{Number(floor.defaultLiftFee).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Default Waste Management:</span>
                      <span className="font-semibold text-slate-700">₹{Number(floor.defaultWasteFee).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/rooms?floor=${floor.floorNumber}`}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                  >
                    <span>View Floor Rooms</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Floor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">
                {editingFloor ? `Edit Floor ${editingFloor.floorNumber}` : '+ Add New Floor'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFloor} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Floor Number
                  </label>
                  <input
                    type="number"
                    required
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Floor Name
                  </label>
                  <input
                    type="text"
                    required
                    value={floorName}
                    onChange={(e) => setFloorName(e.target.value)}
                    placeholder="e.g. 1st Floor"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Default Room Rent (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={defaultRent}
                  onChange={(e) => setDefaultRent(e.target.value)}
                  placeholder="8000.00"
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
                    value={defaultLiftFee}
                    onChange={(e) => setDefaultLiftFee(e.target.value)}
                    placeholder="500.00"
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
                    value={defaultWasteFee}
                    onChange={(e) => setDefaultWasteFee(e.target.value)}
                    placeholder="200.00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm"
                >
                  {editingFloor ? 'Save Changes' : 'Create Floor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
