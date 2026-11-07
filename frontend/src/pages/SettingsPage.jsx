import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { QrCode, Upload, Save, Sparkles, Building2, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [apartmentName, setApartmentName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [demoModeActive, setDemoModeActive] = useState(true);
  const [qrFile, setQrFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      setSettings(res.data);
      setApartmentName(res.data.apartmentName || 'SNNS Apartment');
      setUpiId(res.data.upiId || 'snnsapartment@okaxis');
      setDemoModeActive(res.data.demoModeActive ?? true);
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings', {
        apartmentName,
        upiId,
        demoModeActive
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      fetchSettings();
    } catch (e) {
      alert('Failed to save settings: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleUploadQr = async (e) => {
    e.preventDefault();
    if (!qrFile) return;

    try {
      const formData = new FormData();
      formData.append('qrFile', qrFile);

      await api.post('/settings/upload-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Official Apartment UPI QR Code uploaded successfully!');
      setQrFile(null);
      fetchSettings();
    } catch (e) {
      alert('Failed to upload QR code: ' + (e.response?.data?.message || e.message));
    }
  };

  const currentQrUrl = settings?.qrCodePath ? `/api/files/${settings.qrCodePath}` : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Apartment & Payment QR Settings</h2>
        <p className="text-sm text-slate-500">
          Upload your official payment QR Code, set apartment name, and manage demo settings.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* QR Code Upload Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <QrCode className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-slate-900 text-lg">Official UPI QR Code</h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          This QR code is displayed to all residents and sub-tenants when paying their monthly maintenance and rent bills.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
            {currentQrUrl ? (
              <img
                src={currentQrUrl}
                alt="Current UPI QR Code"
                className="w-56 h-56 object-contain rounded-xl shadow-sm border border-slate-200"
              />
            ) : (
              <div className="w-56 h-56 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                <QrCode className="w-16 h-16 text-slate-300 mb-2" />
                <span className="text-xs text-slate-400 font-medium">No custom QR image uploaded</span>
              </div>
            )}
            <span className="text-[11px] text-slate-500 font-medium mt-3">
              Active Official QR Code
            </span>
          </div>

          <form onSubmit={handleUploadQr} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Upload New QR Code Image (GPay / PhonePe / Paytm / BHIM)
              </label>
              <input
                type="file"
                required
                accept="image/*"
                onChange={(e) => setQrFile(e.target.files[0])}
                className="w-full text-xs text-slate-600 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Supported formats: PNG, JPG, JPEG. Ensure high resolution for clear scanning.
              </p>
            </div>

            <button
              type="submit"
              disabled={!qrFile}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>Update QR Code Image</span>
            </button>
          </form>
        </div>
      </div>

      {/* General Settings Card */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 mb-2">
          <Building2 className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-slate-900 text-lg">General Configurations</h3>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Apartment Complex Name</label>
          <input
            type="text"
            required
            value={apartmentName}
            onChange={(e) => setApartmentName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Apartment UPI VPA ID</label>
          <input
            type="text"
            required
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. snnsapartment@okaxis"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
          />
        </div>

        {/* 30-Day Demo / Subscription Info */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800">30-Day Demo / Subscription Mode</span>
            <p className="text-xs text-slate-500 mt-0.5">
              Trial Expiration Date: {settings?.demoExpiryDate || 'In 30 days'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={demoModeActive}
            onChange={(e) => setDemoModeActive(e.target.checked)}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          className="flex items-center space-x-1.5 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}
