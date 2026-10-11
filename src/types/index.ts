export type DocumentType = 'devis' | 'bon_commande' | 'facture';

export type DevisStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse';
export type BonCommandeStatus = 'brouillon' | 'confirme' | 'en_cours' | 'livre';
export type FactureStatus = 'brouillon' | 'a_payer' | 'payee' | 'annulee';

export type AnyDocumentStatus = DevisStatus | BonCommandeStatus | FactureStatus;

export interface LineItem {
  id: string;
  designation: string;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number; // 20, 10, 5.5, 0
}

export interface Client {
  id: string;
  nom: string;
  entreprise?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  siret?: string;
  createdAt: string;
}

export interface CommercialDocument {
  id: string;
  type: DocumentType;
  numero: string; // DEV-2026-001, BC-2026-001, FAC-2026-001
  dateEmission: string; // YYYY-MM-DD
  dateEcheance?: string; // Validité ou échéance
  statut: AnyDocumentStatus;
  
  // Case Client intégrée
  client: Client;
  
  // Lignes / Désignations
  lignes: LineItem[];
  
  // Notes et conditions simples
  modeReglement?: string;
  notes?: string;

  // Traçabilité de conversion
  sourceDocumentNumero?: string;
  convertedToDocumentNumero?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  nom: string;
  logoUrl?: string; // Logo supplémentaire de l'entreprise pour l'en-tête des documents à imprimer
  slogan?: string;
  formeJuridique?: string;
  siret: string;
  numeroTva: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  email: string;
  iban: string;
  bic: string;
  mentionsLegales: string;
  prefixDevis: string;
  prefixBonCommande: string;
  prefixFacture: string;
  devise: string;
}

export interface ThemeColor {
  id: string;
  name: string;
  primary: string;
  hover: string;
  light: string;
  accent?: string;
}

export interface AppData {
  documents: CommercialDocument[];
  clients: Client[];
  company: CompanySettings;
  theme: {
    currentColor: string;
    presetId: string;
  };
}
