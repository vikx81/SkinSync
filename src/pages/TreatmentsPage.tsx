import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Calendar, Trash2, Edit2, X, Camera, Syringe } from 'lucide-react';
import { useTreatments } from '../hooks/useTreatments';
import { uploadPhoto } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { TreatmentType } from '../types/database';
import toast from 'react-hot-toast';

const treatmentTypes: TreatmentType[] = [
  'EXION',
  'IPL',
  'Microneedling',
  'Chemical Peel',
  'Laser',
  'Botox',
  'Filler',
  'HydraFacial',
  'LED Therapy',
  'Other',
];

export function TreatmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [treatmentType, setTreatmentType] = useState<TreatmentType>('EXION');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [bufferDays, setBufferDays] = useState(7);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { treatments, loading, addTreatment, updateTreatment, deleteTreatment } = useTreatments();
  const user = useAuthStore((state) => state.user);

  const resetForm = () => {
    setTreatmentType('EXION');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setBufferDays(7);
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditingId(null);
    setShowForm(false);
  };

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

  const handleEdit = (treatment: typeof treatments[0]) => {
    setEditingId(treatment.id);
    setTreatmentType(treatment.treatment_type);
    setDate(treatment.date);
    setNotes(treatment.notes || '');
    setBufferDays(treatment.buffer_days);
    setPhotoPreview(treatment.photo_url || null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let photoUrl: string | undefined;
    if (photoFile && user) {
      photoUrl = (await uploadPhoto(photoFile, user.id, 'treatment')) || undefined;
    }

    if (editingId) {
      const { error } = await updateTreatment(editingId, {
        treatment_type: treatmentType,
        date,
        notes: notes || undefined,
        buffer_days: bufferDays,
        ...(photoUrl && { photo_url: photoUrl }),
      });

      if (error) {
        toast.error('Failed to update treatment');
      } else {
        toast.success('Treatment updated!');
        resetForm();
      }
    } else {
      const { error } = await addTreatment({
        treatment_type: treatmentType,
        date,
        notes: notes || undefined,
        buffer_days: bufferDays,
        photo_url: photoUrl,
      });

      if (error) {
        toast.error('Failed to add treatment');
      } else {
        toast.success('Treatment logged! Retinol products will be hidden for buffer period.');
        resetForm();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this treatment?')) return;

    const { error } = await deleteTreatment(id);
    if (error) {
      toast.error('Failed to delete treatment');
    } else {
      toast.success('Treatment deleted');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 shadow-soft-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
              <Syringe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="section-header">Treatments</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Professional skincare treatments
              </p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              {editingId ? 'Edit Treatment' : 'Log Treatment'}
            </h2>
            <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Treatment Type</label>
              <select
                value={treatmentType}
                onChange={(e) => setTreatmentType(e.target.value as TreatmentType)}
                className="select"
              >
                {treatmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label">Buffer Days (retinol restriction)</label>
              <input
                type="number"
                value={bufferDays}
                onChange={(e) => setBufferDays(parseInt(e.target.value) || 7)}
                min={1}
                max={30}
                className="input"
              />
              <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                💡 Retinol will be hidden {bufferDays} days before and after treatment
              </p>
            </div>

            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input min-h-[80px]"
                placeholder="Provider, location, observations..."
              />
            </div>

            <div>
              <label className="label">Photo (optional)</label>
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-soft transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-all bg-gray-50 dark:bg-gray-800/30">
                  <Camera className="w-7 h-7 text-gray-400" />
                  <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">Add photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Treatments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : treatments.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/20 dark:to-accent-800/20 flex items-center justify-center mx-auto mb-4">
            <Syringe className="w-8 h-8 text-accent-600 dark:text-accent-400" />
          </div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
            No Treatments Yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Log your first professional treatment to track retinol buffer periods.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {treatment.treatment_type}
                    </h3>
                    <span className="badge-info text-xs">
                      {treatment.buffer_days}d buffer
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(treatment.date), 'MMMM d, yyyy')}
                  </p>
                  {treatment.notes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      {treatment.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => handleEdit(treatment)}
                    className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(treatment.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {treatment.photo_url && (
                <img
                  src={treatment.photo_url}
                  alt="Treatment"
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
