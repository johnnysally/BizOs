import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Archive, Package, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { productApi } from '@/api/products';
import { formatCurrency } from '@/utils/currency';
import type { Product, CreateProductInput } from '@/types/product';

const UNITS = [
  { value: 'piece', label: 'Piece' },
  { value: 'coil', label: 'Coil' },
  { value: 'length', label: 'Length' },
  { value: 'box', label: 'Box' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'litre', label: 'Litre' },
];

const DEFAULT_CATEGORIES = [
  'Cables',
  'Sockets',
  'Breakers',
  'Lighting',
  'Appliances',
  'Finishes',
  'Other',
];

const PAGE_SIZE = 20;

function statusOf(p: Product): 'active' | 'low' | 'out' | 'archived' {
  if (!p.active) return 'archived';
  if (p.stock === 0) return 'out';
  if (p.stock <= p.lowStockThreshold) return 'low';
  return 'active';
}

const STATUS_LABEL: Record<ReturnType<typeof statusOf>, string> = {
  active: 'Active',
  low: 'Low stock',
  out: 'Out of stock',
  archived: 'Archived',
};

const STATUS_VARIANT: Record<
  ReturnType<typeof statusOf>,
  'success' | 'warning' | 'danger' | 'neutral'
> = {
  active: 'success',
  low: 'warning',
  out: 'danger',
  archived: 'neutral',
};

export default function Products() {
  const { toast } = useNotifications();

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'low' | 'out' | 'archived'>('all');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        category: category || undefined,
        active: status === 'archived' ? false : status === 'all' ? undefined : true,
      });
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load products',
      });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category, status, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setSelectedIds([]);
  }, [page, debouncedSearch, category, status]);

  const categories = useMemo(() => {
    const fromItems = items.map((p) => p.category).filter(Boolean) as string[];
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromItems])).sort();
  }, [items]);

  const filteredByStatus = useMemo(() => {
    if (status === 'all' || status === 'archived') return items;
    return items.filter((p) => statusOf(p) === status);
  }, [items, status]);

  const toggleRow = (id: string) =>
    setSelectedIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );

  const toggleAll = () => {
    if (selectedIds.length === filteredByStatus.length) setSelectedIds([]);
    else setSelectedIds(filteredByStatus.map((p) => p._id));
  };

  const archiveSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Archive ${selectedIds.length} product(s)?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => productApi.remove(id)));
      toast({ type: 'success', message: 'Products archived' });
      setSelectedIds([]);
      load();
    } catch {
      toast({ type: 'error', message: 'Archive failed' });
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Products</h1>
          <p className="text-sm text-muted mt-1">
            {total} item{total === 1 ? '' : 's'} in catalog
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setCreating(true)}>
          Add product
        </Button>
      </div>

      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-border">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU, supplier..."
            icon={<Search size={14} />}
          />
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All categories' },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'low', label: 'Low stock' },
              { value: 'out', label: 'Out of stock' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-brand-50 dark:bg-brand-500/10 border-b border-border">
            <span className="text-sm text-fg">
              {selectedIds.length} selected
            </span>
            <Button
              size="sm"
              variant="danger"
              icon={<Archive size={14} />}
              onClick={archiveSelected}
            >
              Archive selected
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated border-b border-border">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      filteredByStatus.length > 0 &&
                      selectedIds.length === filteredByStatus.length
                    }
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted">Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Category</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Price</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Margin</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Stock</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : filteredByStatus.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    No products match these filters.
                  </td>
                </tr>
              ) : (
                filteredByStatus.map((p) => {
                  const s = statusOf(p);
                  const margin =
                    p.price > 0
                      ? Math.round(((p.price - p.cost) / p.price) * 100)
                      : 0;
                  return (
                    <tr
                      key={p._id}
                      onClick={() => setEditing(p)}
                      className="hover:bg-elevated cursor-pointer transition"
                    >
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(p._id)}
                          onChange={() => toggleRow(p._id)}
                          aria-label={`Select ${p.name}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-fg">{p.name}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {p.sku || '—'}
                          {p.unit && ` · ${p.unit}`}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {p.category || 'Uncategorised'}
                      </td>
                      <td className="px-4 py-3 text-right text-fg">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="px-4 py-3 text-right text-fg">
                        {margin}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-fg">{p.stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[s]}>
                          {STATUS_LABEL[s]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-elevated text-sm">
            <span className="text-muted">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {creating && (
        <ProductFormModal
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
          }}
          categories={categories}
        />
      )}

      {editing && (
        <ProductFormModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
          categories={categories}
        />
      )}
    </div>
  );
}

interface FormModalProps {
  product?: Product;
  categories: string[];
  onClose: () => void;
  onSaved: () => void;
}

function ProductFormModal({ product, categories, onClose, onSaved }: FormModalProps) {
  const { toast } = useNotifications();
  const isEdit = Boolean(product);

  const [form, setForm] = useState<CreateProductInput>({
    name: product?.name || '',
    price: product?.price ?? 0,
    sku: product?.sku || '',
    category: product?.category || categories[0] || 'Other',
    unit: product?.unit || 'piece',
    supplier: product?.supplier || '',
    location: product?.location || '',
    cost: product?.cost ?? 0,
    stock: product?.stock ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 5,
    imageUrl: product?.imageUrl || undefined,
    imagePublicId: product?.imagePublicId || undefined,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const setField = <K extends keyof CreateProductInput>(
    k: K,
    v: CreateProductInput[K]
  ) => setForm((cur) => ({ ...cur, [k]: v }));

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const res = await productApi.uploadImage(file);
      setField('imageUrl', res.url);
      setField('imagePublicId', res.publicId);
      toast({ type: 'success', message: 'Image uploaded' });
    } catch {
      toast({ type: 'error', message: 'Image upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.name.trim()) {
      toast({ type: 'error', message: 'Product name is required' });
      return;
    }
    if (!Number.isFinite(form.price) || form.price < 0) {
      toast({ type: 'error', message: 'Enter a valid price' });
      return;
    }
    setSaving(true);
    try {
      if (isEdit && product) {
        await productApi.update(product._id, form);
        toast({ type: 'success', message: 'Product updated' });
      } else {
        await productApi.create(form);
        toast({ type: 'success', message: 'Product added' });
      }
      onSaved();
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit product' : 'Add product'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-md border border-border bg-elevated flex items-center justify-center overflow-hidden shrink-0">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt={form.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={20} className="text-muted" />
            )}
          </div>
          <div>
            <input
              id="product-image"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadImage(f);
                e.target.value = '';
              }}
            />
            <label htmlFor="product-image">
              <Button
                size="sm"
                variant="outline"
                loading={uploading}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('product-image')?.click();
                }}
              >
                {form.imageUrl ? 'Change image' : 'Upload image'}
              </Button>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Product name" required className="sm:col-span-2">
            <Input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. 2.5mm Twin Cable"
            />
          </FormField>

          <FormField label="SKU or barcode">
            <Input
              value={form.sku || ''}
              onChange={(e) => setField('sku', e.target.value)}
              placeholder="CAB-2.5-TW"
            />
          </FormField>

          <FormField label="Category">
            <Select
              value={form.category || ''}
              onChange={(e) => setField('category', e.target.value)}
              options={categories.map((c) => ({ value: c, label: c }))}
            />
          </FormField>

          <FormField label="Unit">
            <Select
              value={form.unit || 'piece'}
              onChange={(e) => setField('unit', e.target.value)}
              options={UNITS}
            />
          </FormField>

          <FormField label="Location">
            <Input
              value={form.location || ''}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="Main Branch"
            />
          </FormField>

          <FormField label="Selling price" required>
            <Input
              type="number"
              min="0"
              value={String(form.price ?? '')}
              onChange={(e) => setField('price', Number(e.target.value))}
            />
          </FormField>

          <FormField label="Cost price">
            <Input
              type="number"
              min="0"
              value={String(form.cost ?? '')}
              onChange={(e) => setField('cost', Number(e.target.value))}
            />
          </FormField>

          <FormField label={isEdit ? 'Current stock' : 'Opening stock'}>
            <Input
              type="number"
              value={String(form.stock ?? '')}
              onChange={(e) => setField('stock', Number(e.target.value))}
              disabled={isEdit}
            />
          </FormField>

          <FormField label="Reorder point">
            <Input
              type="number"
              min="0"
              value={String(form.lowStockThreshold ?? '')}
              onChange={(e) =>
                setField('lowStockThreshold', Number(e.target.value))
              }
            />
          </FormField>

          <FormField label="Supplier" className="sm:col-span-2">
            <Input
              value={form.supplier || ''}
              onChange={(e) => setField('supplier', e.target.value)}
              placeholder="Supplier name"
            />
          </FormField>
        </div>

        {isEdit && (
          <p className="text-xs text-muted">
            To change current stock, use the Inventory page's Adjust action.
          </p>
        )}
      </div>
    </Modal>
  );
}