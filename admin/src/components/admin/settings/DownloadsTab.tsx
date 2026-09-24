import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Download as DownloadIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { settingsApi, DownloadItem } from '@/api/settings';

const PLATFORM_OPTIONS = [
  { value: 'template', label: 'Template' },
  { value: 'web', label: 'Web' },
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
  { value: 'linux', label: 'Linux' },
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
  { value: 'api', label: 'API' },
  { value: 'other', label: 'Other' },
];

interface Draft {
  name: string;
  version: string;
  link: string;
  platform: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

const emptyDraft: Draft = {
  name: '',
  version: '',
  link: '',
  platform: 'template',
  description: '',
  isActive: true,
  sortOrder: 0,
};

export function DownloadsTab() {
  const { toast } = useNotifications();
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<DownloadItem | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DownloadItem | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await settingsApi.getDownloads();
      setItems(list);
    } catch (err) {
      toast({
        type: 'error',
        message: (err as { message?: string }).message || 'Failed to load downloads',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setDraft({ ...emptyDraft, sortOrder: items.length + 1 });
  };

  const openEdit = (item: DownloadItem) => {
    setEditTarget(item);
    setDraft({
      name: item.name,
      version: item.version || '',
      link: item.link,
      platform: item.platform,
      description: item.description || '',
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    });
  };

  const closeModal = () => {
    setEditTarget(null);
    setDraft(null);
  };

  const patch = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const save = async () => {
    if (!draft) return;
    if (!draft.name || !draft.link || !draft.platform) {
      toast({ type: 'error', message: 'Name, link, and platform are required' });
      return;
    }

    setSaving(true);
    try {
      if (editTarget) {
        await settingsApi.updateDownload(editTarget.id, draft);
        toast({ type: 'success', message: 'Download updated' });
      } else {
        await settingsApi.createDownload(draft);
        toast({ type: 'success', message: 'Download added' });
      }
      closeModal();
      load();
    } catch (err) {
      toast({
        type: 'error',
        message: (err as { message?: string }).message || 'Failed to save',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: DownloadItem) => {
    try {
      await settingsApi.updateDownload(item.id, { isActive: !item.isActive });
      toast({ type: 'success', message: item.isActive ? 'Hidden from public' : 'Published publicly' });
      load();
    } catch (err) {
      toast({
        type: 'error',
        message: (err as { message?: string }).message || 'Failed to update',
      });
    }
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await settingsApi.deleteDownload(deleteTarget.id);
      toast({ type: 'success', message: 'Download deleted' });
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast({
        type: 'error',
        message: (err as { message?: string }).message || 'Failed to delete',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-slate-600">
          Manage downloads shown on the public Resources page.
        </p>
        <Button icon={<Plus size={16} />} onClick={openCreate}>
          Add download
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 border border-slate-200 rounded-lg">
          <DownloadIcon size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">
            No downloads yet. Add one to get started.
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Version</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Platform</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Active</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500 truncate max-w-md">
                      {item.link}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.version || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{item.platform}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(item)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                        item.isActive ? 'bg-brand-600' : 'bg-slate-200'
                      }`}
                      aria-label={item.isActive ? 'Hide' : 'Publish'}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition ${
                          item.isActive ? 'translate-x-[18px]' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 rounded hover:bg-slate-100 text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!draft}
        onClose={closeModal}
        title={editTarget ? 'Edit download' : 'Add download'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={save} loading={saving}>
              {editTarget ? 'Save changes' : 'Create'}
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <FormField label="Name" required>
              <Input
                value={draft.name}
                onChange={(e) => patch('name', e.target.value)}
                placeholder="Product Import Template"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Version" hint="e.g. 1.0.0">
                <Input
                  value={draft.version}
                  onChange={(e) => patch('version', e.target.value)}
                  placeholder="1.0"
                />
              </FormField>

              <FormField label="Platform" required>
                <Select
                  value={draft.platform}
                  onChange={(e) => patch('platform', e.target.value)}
                  options={PLATFORM_OPTIONS}
                />
              </FormField>
            </div>

            <FormField
              label="Link"
              required
              hint="External URL or a path under /downloads/"
            >
              <Input
                value={draft.link}
                onChange={(e) => patch('link', e.target.value)}
                placeholder="https://... or /downloads/file.csv"
              />
            </FormField>

            <FormField label="Description" hint="Optional, shown on the public page">
              <Textarea
                value={draft.description}
                onChange={(e) => patch('description', e.target.value)}
                rows={3}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Sort order" hint="Lower shows first">
                <Input
                  type="number"
                  value={draft.sortOrder}
                  onChange={(e) => patch('sortOrder', Number(e.target.value))}
                />
              </FormField>

              <FormField label="Status">
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(e) => patch('isActive', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Active (visible publicly)</span>
                </label>
              </FormField>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete download"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={doDelete} loading={saving}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Permanently delete <strong>{deleteTarget?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}