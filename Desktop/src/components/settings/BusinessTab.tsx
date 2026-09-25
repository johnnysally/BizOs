import { useEffect, useRef, useState } from 'react';
import { Upload, Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { useClient } from '@/context/ClientContext';
import { useNotifications } from '@/context/NotificationContext';
import { profileApi } from '@/api/profile';
import { settingsApi } from '@/api/settings';

interface Props {
  onDirtyChange: (dirty: boolean) => void;
}

const BUSINESS_TYPES = [
  { value: 'retail', label: 'Retail' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'salon', label: 'Salon' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'other', label: 'Other' },
];

const COUNTRIES = [
  { value: 'KE', label: 'Kenya' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'UG', label: 'Uganda' },
  { value: 'RW', label: 'Rwanda' },
];

export function BusinessTab({ onDirtyChange }: Props) {
  const { settings, load } = useClient();
  const { toast } = useNotifications();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [country, setCountry] = useState('KE');
  const [businessType, setBusinessType] = useState('retail');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxPin, setTaxPin] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [initial, setInitial] = useState({
    name: '',
    country: 'KE',
    businessType: 'retail',
    phone: '',
    address: '',
    taxPin: '',
    website: '',
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    profileApi
      .get()
      .then((tenant) => {
        if (!active) return;
        const s = tenant.settings || {};
        const snap = {
          name: tenant.name || '',
          country: tenant.country || 'KE',
          businessType: tenant.businessType || 'retail',
          phone: (s.phone as string) || '',
          address: (s.address as string) || '',
          taxPin: (s.taxPin as string) || '',
          website: (s.website as string) || '',
        };
        setName(snap.name);
        setCountry(snap.country);
        setBusinessType(snap.businessType);
        setPhone(snap.phone);
        setAddress(snap.address);
        setTaxPin(snap.taxPin);
        setWebsite(snap.website);
        setLogoUrl((s.logoUrl as string) || null);
        setInitial(snap);
      })
      .catch(() => toast({ type: 'error', message: 'Could not load profile' }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [toast]);

  useEffect(() => {
    const dirty =
      name !== initial.name ||
      country !== initial.country ||
      businessType !== initial.businessType ||
      phone !== initial.phone ||
      address !== initial.address ||
      taxPin !== initial.taxPin ||
      website !== initial.website;
    onDirtyChange(dirty);
  }, [name, country, businessType, phone, address, taxPin, website, initial, onDirtyChange]);

  const save = async () => {
    if (!name.trim()) {
      toast({ type: 'error', message: 'Business name is required' });
      return;
    }
    setSaving(true);
    try {
      const tenantPatch: Record<string, unknown> = { name };
      if (country !== initial.country) tenantPatch.country = country;
      if (businessType !== initial.businessType)
        tenantPatch.businessType = businessType;

      const settingsPatch: Record<string, unknown> = {};
      if (phone !== initial.phone) settingsPatch.phone = phone;
      if (address !== initial.address) settingsPatch.address = address;
      if (taxPin !== initial.taxPin) settingsPatch.taxPin = taxPin;
      if (website !== initial.website) settingsPatch.website = website;

      const hasTenantPatch = Object.keys(tenantPatch).length > 1 || tenantPatch.name !== initial.name;
      const hasSettingsPatch = Object.keys(settingsPatch).length > 0;

      if (hasTenantPatch) {
        await profileApi.update({ ...tenantPatch, ...(hasSettingsPatch ? { settings: settingsPatch } : {}) });
      } else if (hasSettingsPatch) {
        await settingsApi.update(settingsPatch);
      }

      await load();
      setInitial({ name, country, businessType, phone, address, taxPin, website });
      toast({ type: 'success', message: 'Business details saved' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const res = await profileApi.uploadLogo(file);
      setLogoUrl(res.url);
      await load();
      toast({ type: 'success', message: 'Logo updated' });
    } catch {
      toast({ type: 'error', message: 'Logo upload failed' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Card
      title="Business profile"
      description="Identity and contact details shown on receipts and invoices."
      actions={
        <Button size="sm" icon={<Save size={14} />} loading={saving} onClick={save}>
          Save changes
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg border border-border bg-elevated flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-xs text-muted">No logo</span>
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadLogo(f);
                e.target.value = '';
              }}
            />
            <Button
              size="sm"
              variant="outline"
              icon={<Upload size={14} />}
              loading={uploading}
              onClick={() => fileRef.current?.click()}
            >
              Upload logo
            </Button>
            <p className="text-xs text-muted mt-1.5">PNG or SVG, up to 2 MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Business name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>

          <FormField label="Country">
            <Select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              options={COUNTRIES}
            />
          </FormField>

          <FormField label="Business type">
            <Select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              options={BUSINESS_TYPES}
            />
          </FormField>

          <FormField label="Phone number">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254..."
            />
          </FormField>

          <FormField label="Tax PIN">
            <Input
              value={taxPin}
              onChange={(e) => setTaxPin(e.target.value)}
              placeholder="P051234567X"
            />
          </FormField>

          <FormField label="Website">
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
            />
          </FormField>

          <FormField label="Address" className="sm:col-span-2">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city"
            />
          </FormField>
        </div>
      </div>
    </Card>
  );
}