import type { ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return <div className="table-shell"><table>{children}</table></div>;
}
