import { LineItem, CommercialDocument, DocumentType } from '../types';

export function calculateLineTotals(item: LineItem) {
  const quantite = item.quantite || 0;
  const prixHT = item.prixUnitaireHT || 0;
  const totalHT = quantite * prixHT;
  const tvaMontant = totalHT * ((item.tauxTVA || 0) / 100);
  const totalTTC = totalHT + tvaMontant;

  return {
    totalHT,
    tvaMontant,
    totalTTC,
  };
}

export interface DocumentSummary {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
}

export function calculateDocumentSummary(doc: CommercialDocument): DocumentSummary {
  let totalHT = 0;
  let totalTVA = 0;

  (doc.lignes || []).forEach((l) => {
    const { totalHT: lineHT, tvaMontant } = calculateLineTotals(l);
    totalHT += lineHT;
    totalTVA += tvaMontant;
  });

  return {
    totalHT,
    totalTVA,
    totalTTC: totalHT + totalTVA,
  };
}

export function formatCurrency(amount: number, currency: string = '€'): string {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(rounded)
    .replace('€', currency);
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('fr-FR');
  } catch {
    return dateStr;
  }
}

export function getDocumentTypeLabel(type: DocumentType): string {
  switch (type) {
    case 'devis':
      return 'Devis';
    case 'bon_commande':
      return 'Bon de commande';
    case 'facture':
      return 'Facture';
  }
}

export function getDocumentTypePluralLabel(type: DocumentType): string {
  switch (type) {
    case 'devis':
      return 'Devis';
    case 'bon_commande':
      return 'Bons de commande';
    case 'facture':
      return 'Factures';
  }
}

export function getStatusDetails(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'brouillon':
      return { label: 'Brouillon', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
    case 'envoye':
      return { label: 'Envoyé', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'accepte':
    case 'confirme':
      return { label: 'Accepté / Validé', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'refuse':
      return { label: 'Refusé', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'en_cours':
      return { label: 'En cours', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    case 'livre':
      return { label: 'Livré', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'a_payer':
      return { label: 'À payer', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'payee':
      return { label: 'Payée', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'annulee':
      return { label: 'Annulée', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' };
    default:
      return { label: status, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
  }
}

export function generateNextDocumentNumber(
  type: DocumentType,
  existingDocuments: CommercialDocument[],
  prefixOverride?: string
): string {
  const currentYear = new Date().getFullYear();
  const defaultPrefix =
    type === 'devis' ? 'DEV-' : type === 'bon_commande' ? 'BC-' : 'FAC-';
  const prefix = prefixOverride || defaultPrefix;

  const yearPrefix = `${prefix}${currentYear}-`;
  const matchingDocs = existingDocuments
    .filter((d) => d.type === type && d.numero.startsWith(yearPrefix))
    .map((d) => {
      const parts = d.numero.split('-');
      const seqStr = parts[parts.length - 1];
      const seq = parseInt(seqStr, 10);
      return isNaN(seq) ? 0 : seq;
    });

  const nextSeq = matchingDocs.length > 0 ? Math.max(...matchingDocs) + 1 : 1;
  const paddedSeq = String(nextSeq).padStart(3, '0');

  return `${yearPrefix}${paddedSeq}`;
}
