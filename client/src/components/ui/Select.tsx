import type { SelectHTMLAttributes, ReactNode } from 'react';

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return <select className="field" {...props}>{children}</select>;
}
