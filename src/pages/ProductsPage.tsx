import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, Archive, RotateCcw, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import type { ProductCategory } from '../types/database';
import toast from 'react-hot-toast';

const categories: ProductCategory[] = [
  'cleanser',
  'toner',
  'serum',
  'moisturizer',
  'sunscreen',
  'treatment',
  'eye-cream',
  'mask',
  'exfoliant',
  'retinol',
  'other',
];

export function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showRetired, setShowRetired] = useState(false);
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('serum');
  const [isRetinol, setIsRetinol] = useState(false);
  const [dateStarted, setDateStarted] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [retireReason, setRetireReason] = useState('');
  const [showRetireModal, setShowRetireModal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    activeProducts,
    retiredProducts,
    loading,
    addProduct,
    updateProduct,
    retireProduct,
    reactivateProduct,
    deleteProduct,
  } = useProducts();

  const resetForm = () => {
    setProductName('');
    setBrand('');
    setCategory('serum');
    setIsRetinol(false);
    setDateStarted(new Date().toISOString().split('T')[0]);
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product: typeof activeProducts[0]) => {
    setEditingId(product.id);
    setProductName(product.product_name);
    setBrand(product.brand || '');
    setCategory(product.category);
    setIsRetinol(product.is_retinol);
    setDateStarted(product.date_started);
    setNotes(product.notes || '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingId) {
      const { error } = await updateProduct(editingId, {
        product_name: productName,
        brand: brand || undefined,
        category,
        is_retinol: isRetinol || category === 'retinol',
        date_started: dateStarted,
        notes: notes || undefined,
      });

      if (error) {
        toast.error('Failed to update product');
      } else {
        toast.success('Product updated!');
        resetForm();
      }
    } else {
      const { error } = await addProduct({
        product_name: productName,
        brand: brand || undefined,
        category,
        is_retinol: isRetinol || category === 'retinol',
        date_started: dateStarted,
        notes: notes || undefined,
      });

      if (error) {
        toast.error('Failed to add product');
      } else {
        toast.success('Product added!');
        resetForm();
      }
    }

    setSaving(false);
  };

  const handleRetire = async () => {
    if (!showRetireModal) return;

    const { error } = await retireProduct(showRetireModal, retireReason || undefined);
    if (error) {
      toast.error('Failed to retire product');
    } else {
      toast.success('Product retired');
    }

    setShowRetireModal(null);
    setRetireReason('');
  };

  const handleReactivate = async (id: string) => {
    const { error } = await reactivateProduct(id);
    if (error) {
      toast.error('Failed to reactivate product');
    } else {
      toast.success('Product reactivated!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;

    const { error } = await deleteProduct(id);
    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted');
    }
  };

  const displayProducts = showRetired ? retiredProducts : activeProducts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Product Library
        </h1>
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

      {/* Toggle Active/Retired */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setShowRetired(false)}
          className={`flex-1 py-2 text-sm rounded-md transition-colors ${
            !showRetired
              ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Active ({activeProducts.length})
        </button>
        <button
          onClick={() => setShowRetired(true)}
          className={`flex-1 py-2 text-sm rounded-md transition-colors ${
            showRetired
              ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Retired ({retiredProducts.length})
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {editingId ? 'Edit Product' : 'Add Product'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Product Name *</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="input"
                placeholder="e.g., Vitamin C Serum"
                required
              />
            </div>

            <div>
              <label className="label">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="input"
                placeholder="e.g., SkinCeuticals"
              />
            </div>

            <div>
              <label className="label">Category *</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as ProductCategory);
                  if (e.target.value === 'retinol') setIsRetinol(true);
                }}
                className="select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {category !== 'retinol' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRetinol"
                  checked={isRetinol}
                  onChange={(e) => setIsRetinol(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="isRetinol" className="text-sm text-gray-700 dark:text-gray-300">
                  Contains retinol/retinoid
                </label>
              </div>
            )}

            <div>
              <label className="label">Date Started *</label>
              <input
                type="date"
                value={dateStarted}
                onChange={(e) => setDateStarted(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input min-h-[60px]"
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Loading products...
        </p>
      ) : displayProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {showRetired ? 'No retired products' : 'No products yet. Add your first one!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayProducts.map((product) => (
            <div key={product.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {product.product_name}
                    </h3>
                    {product.is_retinol && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded">
                        Retinol
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {product.brand && `${product.brand} • `}
                    {product.category}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Started: {format(new Date(product.date_started), 'MMM d, yyyy')}
                  </p>
                  {product.status === 'retired' && product.date_stopped && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Stopped: {format(new Date(product.date_stopped), 'MMM d, yyyy')}
                      {product.reason_stopped && ` - ${product.reason_stopped}`}
                    </p>
                  )}
                  {product.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {product.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {product.status === 'active' ? (
                    <>
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-gray-400 hover:text-primary-600"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowRetireModal(product.id)}
                        className="p-2 text-gray-400 hover:text-yellow-600"
                        title="Retire"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleReactivate(product.id)}
                        className="p-2 text-gray-400 hover:text-green-600"
                        title="Reactivate"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Retire Modal */}
      {showRetireModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Retire Product
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This product will be moved to retired and won't appear in routine dropdowns.
            </p>
            <div className="mb-4">
              <label className="label">Reason (optional)</label>
              <input
                type="text"
                value={retireReason}
                onChange={(e) => setRetireReason(e.target.value)}
                className="input"
                placeholder="e.g., Finished, didn't work well..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRetireModal(null);
                  setRetireReason('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button onClick={handleRetire} className="btn-primary flex-1">
                Retire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
