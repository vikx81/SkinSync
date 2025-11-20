import { useState, useEffect } from 'react';
import {
  LogOut,
  Moon,
  Sun,
  Bell,
  Download,
  Clock,
  Camera,
  ChevronRight,
  User,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useProducts } from '../hooks/useProducts';
import { useRoutines } from '../hooks/useRoutines';
import { useTreatments } from '../hooks/useTreatments';
import { usePhotos } from '../hooks/usePhotos';
import { format, parseISO } from 'date-fns';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const [showPhotoComparison, setShowPhotoComparison] = useState(false);
  const [photo1Date, setPhoto1Date] = useState('');
  const [photo2Date, setPhoto2Date] = useState('');

  const { user, signOut } = useAuthStore();
  const { darkMode, toggleDarkMode, settings, fetchSettings, updateSettings } = useSettingsStore();
  const { products } = useProducts();
  const { routines } = useRoutines();
  const { treatments } = useTreatments();
  const { photos, getPhotosByDate } = usePhotos();

  useEffect(() => {
    if (user) {
      fetchSettings(user.id);
    }
  }, [user, fetchSettings]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const handleNotificationToggle = async () => {
    if (settings) {
      await updateSettings({ notifications_enabled: !settings.notifications_enabled });
      toast.success(
        settings.notifications_enabled ? 'Notifications disabled' : 'Notifications enabled'
      );
    }
  };

  const handleRetinolReminderToggle = async () => {
    if (settings) {
      await updateSettings({ retinol_reminder_enabled: !settings.retinol_reminder_enabled });
    }
  };

  const exportToCSV = () => {
    const routineData = routines.map((r) => ({
      Date: r.date,
      'Time of Day': r.time_of_day,
      Products: r.product_ids
        .map((id) => products.find((p) => p.id === id)?.product_name || 'Unknown')
        .join(', '),
      Notes: r.notes || '',
    }));

    const treatmentData = treatments.map((t) => ({
      Date: t.date,
      'Treatment Type': t.treatment_type,
      'Buffer Days': t.buffer_days,
      Notes: t.notes || '',
    }));

    const productData = products.map((p) => ({
      Name: p.product_name,
      Brand: p.brand || '',
      Category: p.category,
      Status: p.status,
      'Date Started': p.date_started,
      'Date Stopped': p.date_stopped || '',
      'Contains Retinol': p.is_retinol ? 'Yes' : 'No',
    }));

    const routineCSV = Papa.unparse(routineData);
    const treatmentCSV = Papa.unparse(treatmentData);
    const productCSV = Papa.unparse(productData);

    const blob = new Blob(
      [
        'ROUTINES\n',
        routineCSV,
        '\n\nTREATMENTS\n',
        treatmentCSV,
        '\n\nPRODUCTS\n',
        productCSV,
      ],
      { type: 'text/csv' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skinsync-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Data exported to CSV');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.text('SkinSync Report', 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 20, y);
    y += 15;

    // Products Summary
    doc.setFontSize(14);
    doc.text('Products Summary', 20, y);
    y += 10;

    doc.setFontSize(10);
    const activeCount = products.filter((p) => p.status === 'active').length;
    const retiredCount = products.filter((p) => p.status === 'retired').length;
    doc.text(`Active: ${activeCount} | Retired: ${retiredCount}`, 20, y);
    y += 15;

    // Recent Routines
    doc.setFontSize(14);
    doc.text('Recent Routines', 20, y);
    y += 10;

    doc.setFontSize(10);
    const recentRoutines = routines.slice(0, 10);
    recentRoutines.forEach((routine) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const productNames = routine.product_ids
        .map((id) => products.find((p) => p.id === id)?.product_name || 'Unknown')
        .join(', ');
      doc.text(`${routine.date} ${routine.time_of_day}: ${productNames}`, 20, y);
      y += 7;
    });

    y += 10;

    // Recent Treatments
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.text('Recent Treatments', 20, y);
    y += 10;

    doc.setFontSize(10);
    const recentTreatments = treatments.slice(0, 10);
    recentTreatments.forEach((treatment) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${treatment.date}: ${treatment.treatment_type}`, 20, y);
      y += 7;
    });

    doc.save(`skinsync-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('Report exported to PDF');
  };

  const photo1 = photo1Date ? getPhotosByDate(photo1Date)[0] : null;
  const photo2 = photo2Date ? getPhotosByDate(photo2Date)[0] : null;

  const availableDates = [...new Set(photos.map((p) => p.date))].sort().reverse();

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 shadow-soft-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="section-header">Profile</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="card overflow-hidden">
        {/* Dark Mode */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
            }`}>
              {darkMode ? (
                <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
          </div>
          <div
            className={`w-12 h-7 rounded-full transition-all shadow-inner ${
              darkMode ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full mt-1 transition-transform shadow-soft ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </div>
        </button>

        {/* Notifications */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleNotificationToggle}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">Notifications</span>
            </div>
            <div
              className={`w-12 h-7 rounded-full transition-all shadow-inner ${
                settings?.notifications_enabled ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full mt-1 transition-transform shadow-soft ${
                  settings?.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Retinol Reminders */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleRetinolReminderToggle}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              </div>
              <div className="text-left">
                <span className="font-medium text-gray-900 dark:text-white block">Retinol Reminders</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Remind to use retinol products</span>
              </div>
            </div>
            <div
              className={`w-12 h-7 rounded-full transition-all shadow-inner ${
                settings?.retinol_reminder_enabled ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full mt-1 transition-transform shadow-soft ${
                  settings?.retinol_reminder_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Progress Photos */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setShowPhotoComparison(!showPhotoComparison)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Photo Comparison</span>
          </div>
          <ChevronRight
            className={`w-5 h-5 text-gray-400 transition-transform ${
              showPhotoComparison ? 'rotate-90' : ''
            }`}
          />
        </button>

        {showPhotoComparison && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Before</label>
                <select
                  value={photo1Date}
                  onChange={(e) => setPhoto1Date(e.target.value)}
                  className="select text-sm"
                >
                  <option value="">Select date</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {format(parseISO(date), 'MMM d, yyyy')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">After</label>
                <select
                  value={photo2Date}
                  onChange={(e) => setPhoto2Date(e.target.value)}
                  className="select text-sm"
                >
                  <option value="">Select date</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {format(parseISO(date), 'MMM d, yyyy')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(photo1 || photo2) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                  {photo1 ? (
                    <img src={photo1.url} alt="Before" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No photo
                    </div>
                  )}
                </div>
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                  {photo2 ? (
                    <img src={photo2.url} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No photo
                    </div>
                  )}
                </div>
              </div>
            )}

            {availableDates.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No photos available. Add photos to your routines to compare progress.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="card overflow-hidden">
        <button
          onClick={exportToCSV}
          className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-white block">Export to CSV</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">Download all data as spreadsheet</span>
          </div>
        </button>

        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={exportToPDF}
            className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Download className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white block">Export to PDF</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Download summary report</span>
            </div>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="card p-6">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Your Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{products.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Products</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{routines.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Routines</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{treatments.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Treatments</p>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 p-5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all font-medium shadow-soft hover:shadow-soft-lg"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
}
