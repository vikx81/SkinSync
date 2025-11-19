import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Sun, Moon, Plus, X, Camera, AlertTriangle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useRoutines } from '../hooks/useRoutines';
import { useTreatments } from '../hooks/useTreatments';
import { uploadPhoto } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { TimeOfDay } from '../types/database';
import toast from 'react-hot-toast';

export function RoutinePage() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('AM');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { activeProducts, loading: productsLoading } = useProducts();
  const { addRoutine, getTodayRoutines } = useRoutines();
  const { isRetinolBlocked } = useTreatments();
  const user = useAuthStore((state) => state.user);

  const todayRoutines = getTodayRoutines();
  const existingRoutine = todayRoutines.find((r) => r.time_of_day === timeOfDay);

  const retinolCheck = isRetinolBlocked();

  // Filter out retinol products if blocked
  const availableProducts = activeProducts.filter((p) => {
    if (retinolCheck.blocked && (p.is_retinol || p.category === 'retinol')) {
      return false;
    }
    return true;
  });

  const blockedRetinolProducts = activeProducts.filter(
    (p) => retinolCheck.blocked && (p.is_retinol || p.category === 'retinol')
  );

  useEffect(() => {
    if (existingRoutine) {
      setSelectedProducts(existingRoutine.product_ids);
      setNotes(existingRoutine.notes || '');
    } else {
      setSelectedProducts([]);
      setNotes('');
    }
  }, [existingRoutine, timeOfDay]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSave = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    setSaving(true);

    let photoUrl: string | undefined;
    if (photoFile && user) {
      photoUrl = (await uploadPhoto(photoFile, user.id, 'routine')) || undefined;
    }

    const { error } = await addRoutine({
      time_of_day: timeOfDay,
      product_ids: selectedProducts,
      notes: notes || undefined,
      photo_url: photoUrl,
    });

    if (error) {
      toast.error('Failed to save routine');
    } else {
      toast.success('Routine logged successfully!');
      setPhotoFile(null);
      setPhotoPreview(null);
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Daily Routine
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* AM/PM Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setTimeOfDay('AM')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-medium transition-colors ${
            timeOfDay === 'AM'
              ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Sun className="w-5 h-5" />
          Morning
        </button>
        <button
          onClick={() => setTimeOfDay('PM')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-medium transition-colors ${
            timeOfDay === 'PM'
              ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Moon className="w-5 h-5" />
          Evening
        </button>
      </div>

      {/* Retinol Warning */}
      {retinolCheck.blocked && blockedRetinolProducts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Retinol Products Hidden
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {retinolCheck.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Selection */}
      <div className="card p-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
          Select Products
        </h2>
        {productsLoading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
        ) : availableProducts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No products available. Add some in the Products tab.
          </p>
        ) : (
          <div className="space-y-2">
            {availableProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedProducts.includes(product.id)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.product_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.brand && `${product.brand} • `}
                      {product.category}
                    </p>
                  </div>
                  {selectedProducts.includes(product.id) && (
                    <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white rotate-45" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="card p-4">
        <label className="label">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input min-h-[80px]"
          placeholder="How does your skin feel today?"
        />
      </div>

      {/* Photo Upload */}
      <div className="card p-4">
        <label className="label">Photo (optional)</label>
        {photoPreview ? (
          <div className="relative">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={removePhoto}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
            <Camera className="w-8 h-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">Add a photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || selectedProducts.length === 0}
        className="btn-primary w-full"
      >
        {saving ? 'Saving...' : existingRoutine ? 'Update Routine' : 'Log Routine'}
      </button>
    </div>
  );
}
