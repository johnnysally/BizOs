import type { ReactNode } from 'react';

export function Modal({ children }: { children: ReactNode }) {
  return <div className="modal-backdrop"><div className="payment-modal">{children}</div></div>;
}
