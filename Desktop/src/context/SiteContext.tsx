import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { siteApi } from '@/api/site';
import type { SiteSettings, Country, PublicPlan } from '@/api/site';

interface SiteValue {
  settings: SiteSettings | null;
  businessTypes: string[];
  countries: Country[];
  currencies: string[];
  legalLinks: Record<string, string>;
  plans: PublicPlan[];
  featureFlags: { registrationOpen: boolean; maintenanceMode: boolean };
  status: 'idle' | 'loading' | 'ready' | 'error';
  load: () => Promise<void>;
}

const DEFAULT_FLAGS = { registrationOpen: true, maintenanceMode: false };

const SiteContext = createContext<SiteValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [legalLinks, setLegalLinks] = useState<Record<string, string>>({});
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [featureFlags, setFeatureFlags] = useState(DEFAULT_FLAGS);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const load = async () => {
    setStatus('loading');
    try {
      const [
        s,
        bt,
        co,
        cu,
        ll,
        fl,
        pl,
      ] = await Promise.all([
        siteApi.getSettings(),
        siteApi.getBusinessTypes(),
        siteApi.getCountries(),
        siteApi.getCurrencies(),
        siteApi.getLegalLinks(),
        siteApi.getFeatureFlags(),
        siteApi.getPlans(),
      ]);

      setSettings(s);
      setBusinessTypes(bt);
      setCountries(co);
      setCurrencies(cu);
      setLegalLinks(ll);
      setFeatureFlags({ ...DEFAULT_FLAGS, ...fl });
      setPlans(pl);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SiteContext.Provider
      value={{
        settings,
        businessTypes,
        countries,
        currencies,
        legalLinks,
        plans,
        featureFlags,
        status,
        load,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
};