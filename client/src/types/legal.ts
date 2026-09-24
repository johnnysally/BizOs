export type LegalType = 'terms' | 'privacy' | 'dpa' | 'refund' | 'aup';

export interface LegalCurrentPublic {
  type: LegalType;
  title: string;
  content: string;
  version?: number;
  effectiveAt?: string;
  publishedAt?: string;
}
