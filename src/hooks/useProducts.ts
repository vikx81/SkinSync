import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Product, ProductCategory, ProductStatus } from '../types/database';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const fetchProducts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (product: {
    product_name: string;
    brand?: string;
    category: ProductCategory;
    is_retinol?: boolean;
    date_started?: string;
    notes?: string;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        user_id: user.id,
        status: 'active' as ProductStatus,
        is_retinol: product.is_retinol ?? product.category === 'retinol',
        date_started: product.date_started ?? new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (!error && data) {
      setProducts((prev) => [data, ...prev]);
    }

    return { data, error };
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? data : p))
      );
    }

    return { data, error };
  };

  const retireProduct = async (id: string, reason?: string) => {
    return updateProduct(id, {
      status: 'retired',
      date_stopped: new Date().toISOString().split('T')[0],
      reason_stopped: reason,
    });
  };

  const reactivateProduct = async (id: string) => {
    return updateProduct(id, {
      status: 'active',
      date_stopped: undefined,
      reason_stopped: undefined,
    });
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }

    return { error };
  };

  const activeProducts = products.filter((p) => p.status === 'active');
  const retiredProducts = products.filter((p) => p.status === 'retired');

  return {
    products,
    activeProducts,
    retiredProducts,
    loading,
    fetchProducts,
    addProduct,
    updateProduct,
    retireProduct,
    reactivateProduct,
    deleteProduct,
  };
}
