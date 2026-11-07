import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Layers, Plus, Edit3, Trash2, AlertCircle, Building, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

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
      setFloors(floorsRes.data || []);
      setRooms(roomsRes.data || []);
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
      <PageHeader
        title="Floors Architecture"
        subtitle="Configure apartment floor levels, default room pricing, and elevator maintenance matrices."
        badge={`${floors.length} Levels`}
        badgeIcon={Layers}
        breadcrumbs={[{ label: 'Floors Matrix' }]}
        actions={
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-ocean-cyan hover:bg-ocean-cyanHover text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Floor</span>
          </button>
        }
      />

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : floors.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Floors Configured"
          description="Create your first building floor to begin assigning apartment flats."
          action={
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-ocean-cyan text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Add Floor 1
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {floors.map((floor) => {
            const floorRooms = rooms.filter(r => r.floorNumber === floor.floorNumber);
            const occupiedRooms = floorRooms.filter(r => r.status === 'OCCUPIED');

            return (
              <div
                key={floor.id}
                className="bg-surface-main p-6 rounded-3xl border border-line-subtle shadow-saas-card hover:shadow-saas-card-hover transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-ocean-deep/10 text-ocean-deep dark:bg-ocean-cyan/20 dark:text-cyan-300 flex items-center justify-center font-extrabold text-lg">
                        {floor.floorNumber}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-content-primary">{floor.floorName}</h3>
                        <p className="text-xs text-content-secondary">
                          {floorRooms.length} flats configured
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(floor)}
                        className="p-1.5 rounded-xl text-content-muted hover:text-ocean-cyan hover:bg-surface-secondary transition"
                        title="Edit floor rates"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFloor(floor)}
                        className="p-1.5 rounded-xl text-content-muted hover:text-red-500 hover:bg-red-500/10 transition"
                        title="Delete floor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Fee Matrix Pills */}
                  <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-surface-secondary/70 border border-line-subtle text-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted block">Rent</span>
                      <span className="text-xs font-bold text-content-primary">₹{floor.defaultRent}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted block">Lift</span>
                      <span className="text-xs font-bold text-content-primary">₹{floor.defaultLiftFee}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted block">Waste</span>
                      <span className="text-xs font-bold text-content-primary">₹{floor.defaultWasteFee}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-line-subtle flex items-center justify-between text-xs">
                  <span className="text-content-secondary">
                    <span className="font-bold text-content-primary">{occupiedRooms.length}</span> of {floorRooms.length} Occupied
                  </span>
                  <Link
                    to={`/rooms?floor=${floor.floorNumber}`}
                    className="font-bold text-ocean-cyan hover:underline flex items-center space-x-1"
                  >
                    <span>View Units</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Floor Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingFloor ? `Edit Floor ${editingFloor.floorNumber}` : 'Configure New Floor'}
        subtitle="Set default fee schedules and naming conventions"
        icon={Layers}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveFloor} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
              Floor Number
            </label>
            <input
              type="number"
              required
              disabled={Boolean(editingFloor)}
              value={floorNumber}
              onChange={(e) => setFloorNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:border-ocean-cyan focus:outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
              Floor Display Name
            </label>
            <input
              type="text"
              required
              value={floorName}
              onChange={(e) => setFloorName(e.target.value)}
              placeholder="e.g. Ground Floor, 1st Floor"
              className="w-full px-3.5 py-2.5 text-sm bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:border-ocean-cyan focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-content-primary uppercase tracking-wider mb-1">
                Default Rent (₹)
              </label>
              <input
                type="number"
                required
                value={defaultRent}
                onChange={(e) => setDefaultRent(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-content-primary uppercase tracking-wider mb-1">
                Lift Fee (₹)
              </label>
              <input
                type="number"
                required
                value={defaultLiftFee}
                onChange={(e) => setDefaultLiftFee(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-content-primary uppercase tracking-wider mb-1">
                Waste Fee (₹)
              </label>
              <input
                type="number"
                required
                value={defaultWasteFee}
                onChange={(e) => setDefaultWasteFee(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2.5 text-xs font-semibold text-content-secondary hover:text-content-primary hover:bg-surface-secondary rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-ocean-cyan hover:bg-ocean-cyanHover rounded-xl shadow-xs transition"
            >
              {editingFloor ? 'Save Changes' : 'Create Floor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
