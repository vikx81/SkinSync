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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>

      {/* User Info */}
      <div className="card p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
        <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
      </div>

      {/* Settings */}
      <div className="card divide-y divide-gray-200 dark:divide-gray-700">
        {/* Dark Mode */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5 text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-gray-900 dark:text-white">Dark Mode</span>
          </div>
          <div
            className={`w-10 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                darkMode ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </div>
        </button>

        {/* Notifications */}
        <button
          onClick={handleNotificationToggle}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900 dark:text-white">Notifications</span>
          </div>
          <div
            className={`w-10 h-6 rounded-full transition-colors ${
              settings?.notifications_enabled ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                settings?.notifications_enabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </div>
        </button>

        {/* Retinol Reminders */}
        <button
          onClick={handleRetinolReminderToggle}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div className="text-left">
              <span className="text-gray-900 dark:text-white block">Retinol Reminders</span>
              <span className="text-xs text-gray-500">Remind to use retinol products</span>
            </div>
          </div>
          <div
            className={`w-10 h-6 rounded-full transition-colors ${
              settings?.retinol_reminder_enabled ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                settings?.retinol_reminder_enabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Progress Photos */}
      <div className="card p-4">
        <button
          onClick={() => setShowPhotoComparison(!showPhotoComparison)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900 dark:text-white">Photo Comparison</span>
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
              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {photo1 ? (
                    <img src={photo1.url} alt="Before" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No photo
                    </div>
                  )}
                </div>
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
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
      <div className="card divide-y divide-gray-200 dark:divide-gray-700">
        <button
          onClick={exportToCSV}
          className="w-full flex items-center gap-3 p-4 text-left"
        >
          <Download className="w-5 h-5 text-gray-400" />
          <div>
            <span className="text-gray-900 dark:text-white block">Export to CSV</span>
            <span className="text-xs text-gray-500">Download all data as spreadsheet</span>
          </div>
        </button>

        <button
          onClick={exportToPDF}
          className="w-full flex items-center gap-3 p-4 text-left"
        >
          <Download className="w-5 h-5 text-gray-400" />
          <div>
            <span className="text-gray-900 dark:text-white block">Export to PDF</span>
            <span className="text-xs text-gray-500">Download summary report</span>
          </div>
        </button>
      </div>

      {/* Stats */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-600">{products.length}</p>
            <p className="text-xs text-gray-500">Products</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">{routines.length}</p>
            <p className="text-xs text-gray-500">Routines</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">{treatments.length}</p>
            <p className="text-xs text-gray-500">Treatments</p>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 p-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
}
