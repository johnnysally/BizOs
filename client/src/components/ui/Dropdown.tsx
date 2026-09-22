import type { ReactNode } from 'react';

export function Dropdown({ label, children }: { label: string; children: ReactNode }) {
  return <div><strong>{label}</strong>{children}</div>;
}
