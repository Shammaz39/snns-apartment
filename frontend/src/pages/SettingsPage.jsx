import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  QrCode, Upload, Save, Sparkles, Building2, CheckCircle2, 
  ShieldCheck, AlertCircle, CreditCard, Clock 
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [apartmentName, setApartmentName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [demoModeActive, setDemoModeActive] = useState(true);
  const [qrFile, setQrFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      setQrFile(null);
      fetchSettings();
    } catch (e) {
      alert('Failed to upload QR code: ' + (e.response?.data?.message || e.message));
    }
  };

  const currentQrUrl = settings?.qrCodePath ? `/api/files/${settings.qrCodePath}` : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Apartment & Payment QR Settings"
        subtitle="Manage apartment branding, payment gateway VPA, and official UPI QR Code."
      />

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Apartment configurations saved successfully!</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Official Apartment UPI QR Code uploaded successfully!</span>
        </div>
      )}

      {/* QR Code Upload Card */}
      <div className="p-6 rounded-2xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark shadow-xs space-y-5">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-border-light dark:border-border-dark">
          <div className="p-2 rounded-xl bg-ocean-cyan/10 text-ocean-cyan">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-content-light-primary dark:text-content-dark-primary text-base">
              Official UPI QR Code
            </h3>
            <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
              Displayed to residents and sub-tenants when paying monthly maintenance and rent bills.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark">
            {currentQrUrl ? (
              <img
                src={currentQrUrl}
                alt="Current UPI QR Code"
                className="w-56 h-56 object-contain rounded-xl shadow-xs border border-border-light dark:border-border-dark bg-white"
              />
            ) : (
              <div className="w-56 h-56 border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                <QrCode className="w-16 h-16 text-content-light-secondary/40 dark:text-content-dark-secondary/40 mb-2" />
                <span className="text-xs text-content-light-secondary dark:text-content-dark-secondary font-medium">
                  No custom QR image uploaded
                </span>
              </div>
            )}
            <span className="text-[11px] text-content-light-secondary dark:text-content-dark-secondary font-semibold mt-3">
              Active Payment QR Code
            </span>
          </div>

          <form onSubmit={handleUploadQr} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1.5">
                Upload New QR Code Image (GPay / PhonePe / Paytm / BHIM)
              </label>
              <input
                type="file"
                required
                accept="image/*"
                onChange={(e) => setQrFile(e.target.files[0])}
                className="w-full text-xs text-content-light-secondary dark:text-content-dark-secondary file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-ocean-cyan/15 file:text-ocean-cyan hover:file:bg-ocean-cyan/25"
              />
              <p className="text-[11px] text-content-light-secondary/60 dark:text-content-dark-secondary/60 mt-1.5">
                Supported formats: PNG, JPG, JPEG. Ensure high resolution for clear scanning on smartphones.
              </p>
            </div>

            <button
              type="submit"
              disabled={!qrFile}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-ocean-cyan hover:bg-ocean-cyan/90 text-white shadow-xs transition disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>Update QR Code Image</span>
            </button>
          </form>
        </div>
      </div>

      {/* General Settings Card */}
      <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark shadow-xs space-y-5">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-border-light dark:border-border-dark">
          <div className="p-2 rounded-xl bg-ocean-deep/10 dark:bg-ocean-cyan/15 text-ocean-deep dark:text-ocean-cyan">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-content-light-primary dark:text-content-dark-primary text-base">
              General Configurations
            </h3>
            <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary">
              Update organization identity and payment endpoints.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1.5">
            Apartment Complex Name
          </label>
          <input
            type="text"
            required
            value={apartmentName}
            onChange={(e) => setApartmentName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-content-light-secondary dark:text-content-dark-secondary mb-1.5">
            Apartment UPI VPA ID
          </label>
          <input
            type="text"
            required
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. snnsapartment@okaxis"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-content-light-primary dark:text-content-dark-primary focus:ring-2 focus:ring-ocean-cyan outline-none font-mono"
          />
        </div>

        {/* 30-Day Demo / Subscription Info */}
        <div className="p-4 rounded-xl bg-surface-light-secondary dark:bg-surface-dark-secondary border border-border-light dark:border-border-dark flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-ocean-violet/10 text-ocean-violet">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-content-light-primary dark:text-content-dark-primary">
                30-Day Demo / Subscription Mode
              </span>
              <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary mt-0.5">
                Trial Expiration Date: {settings?.demoExpiryDate || 'In 30 days'}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={demoModeActive}
            onChange={(e) => setDemoModeActive(e.target.checked)}
            className="w-4 h-4 rounded text-ocean-cyan focus:ring-ocean-cyan"
          />
        </div>

        <button
          type="submit"
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-ocean-cyan hover:bg-ocean-cyan/90 text-white shadow-xs transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}
