import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  AppData,
  CommercialDocument,
  Client,
  CompanySettings,
  DocumentType,
} from '../types';
import { loadAppData, saveAppData } from '../utils/storage';
import { INITIAL_APP_DATA } from '../constants/seedData';
import { applyThemeToDocument, THEME_PRESETS } from '../constants/themes';
import { generateNextDocumentNumber } from '../utils/formatters';

export type AppTab = 'devis' | 'bon_commande' | 'facture' | 'settings';

interface AppContextType {
  data: AppData;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  lastSaved: Date;
  saveStatus: 'saved' | 'saving';
  todayDate: string; // YYYY-MM-DD

  // Documents
  addDocument: (type: DocumentType) => CommercialDocument;
  updateDocument: (id: string, updates: Partial<CommercialDocument>) => void;
  deleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => CommercialDocument;
  convertDocument: (sourceDocId: string, targetType: DocumentType) => CommercialDocument;

  // Modals & Active state
  editingDocument: CommercialDocument | null;
  setEditingDocument: (doc: CommercialDocument | null) => void;
  printingDocument: CommercialDocument | null;
  setPrintingDocument: (doc: CommercialDocument | null) => void;

  // Settings & Themes & Logo
  updateCompany: (updates: Partial<CompanySettings>) => void;
  setCompanyLogo: (logoBase64: string) => void;
  setThemeColor: (colorHex: string, presetId?: string) => void;
  themeModalOpen: boolean;
  setThemeModalOpen: (open: boolean) => void;
  resetToDefaults: () => void;
  exportBackup: () => void;
  importBackup: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<AppTab>('devis');
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // L'application s'ouvre à la date du jour
  const todayDate = new Date().toISOString().split('T')[0];

  const [editingDocument, setEditingDocument] = useState<CommercialDocument | null>(null);
  const [printingDocument, setPrintingDocument] = useState<CommercialDocument | null>(null);
  const [themeModalOpen, setThemeModalOpen] = useState<boolean>(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Apply theme color
  useEffect(() => {
    applyThemeToDocument(data.theme.currentColor);
  }, [data.theme.currentColor]);

  // Debounced auto-save
  useEffect(() => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      saveAppData(data);
      setSaveStatus('saved');
      setLastSaved(new Date());
    }, 300);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data]);

  // Add document (initialized strictly with today's date)
  const addDocument = useCallback(
    (type: DocumentType): CommercialDocument => {
      const prefix =
        type === 'devis'
          ? data.company.prefixDevis
          : type === 'bon_commande'
          ? data.company.prefixBonCommande
          : data.company.prefixFacture;

      const numero = generateNextDocumentNumber(type, data.documents, prefix);
      const today = new Date().toISOString().split('T')[0];

      const newDoc: CommercialDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        numero,
        dateEmission: today, // Date du jour
        statut: type === 'facture' ? 'a_payer' : type === 'devis' ? 'brouillon' : 'en_cours',
        client: {
          id: `cli-${Date.now()}`,
          nom: '',
          entreprise: '',
          email: '',
          telephone: '',
          adresse: '',
          codePostal: '',
          ville: '',
          createdAt: new Date().toISOString(),
        },
        lignes: [
          {
            id: `lig-${Date.now()}-1`,
            designation: '',
            quantite: 1,
            prixUnitaireHT: 0,
            tauxTVA: 20,
          },
        ],
        modeReglement: 'Virement bancaire',
        notes: type === 'devis' ? 'Devis valable 30 jours à compter de sa date d’émission.' : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setData((prev) => ({
        ...prev,
        documents: [newDoc, ...prev.documents],
      }));

      setEditingDocument(newDoc);
      setActiveTab(type);
      return newDoc;
    },
    [data.company, data.documents]
  );

  const updateDocument = useCallback((id: string, updates: Partial<CommercialDocument>) => {
    setData((prev) => {
      const updatedDocs = prev.documents.map((d) => {
        if (d.id === id) {
          return {
            ...d,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return d;
      });
      return { ...prev, documents: updatedDocs };
    });

    setEditingDocument((curr) => {
      if (curr && curr.id === id) {
        return { ...curr, ...updates, updatedAt: new Date().toISOString() };
      }
      return curr;
    });
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== id),
    }));
    setEditingDocument((curr) => (curr && curr.id === id ? null : curr));
    setPrintingDocument((curr) => (curr && curr.id === id ? null : curr));
  }, []);

  const duplicateDocument = useCallback(
    (id: string): CommercialDocument => {
      const target = data.documents.find((d) => d.id === id);
      if (!target) throw new Error('Document introuvable');

      const prefix =
        target.type === 'devis'
          ? data.company.prefixDevis
          : target.type === 'bon_commande'
          ? data.company.prefixBonCommande
          : data.company.prefixFacture;

      const nextNum = generateNextDocumentNumber(target.type, data.documents, prefix);
      const today = new Date().toISOString().split('T')[0];

      const duplicated: CommercialDocument = {
        ...target,
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        numero: nextNum,
        statut: 'brouillon',
        dateEmission: today, // Date du jour
        sourceDocumentNumero: undefined,
        convertedToDocumentNumero: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lignes: target.lignes.map((l) => ({
          ...l,
          id: `lig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        })),
      };

      setData((prev) => ({
        ...prev,
        documents: [duplicated, ...prev.documents],
      }));

      setEditingDocument(duplicated);
      return duplicated;
    },
    [data.documents, data.company]
  );

  /**
   * Conversion 1-clic :
   * - Devis -> Bon de commande
   * - Bon de commande -> Facture
   * - Devis -> Facture
   */
  const convertDocument = useCallback(
    (sourceDocId: string, targetType: DocumentType): CommercialDocument => {
      const source = data.documents.find((d) => d.id === sourceDocId);
      if (!source) throw new Error('Document source introuvable');

      const prefix =
        targetType === 'devis'
          ? data.company.prefixDevis
          : targetType === 'bon_commande'
          ? data.company.prefixBonCommande
          : data.company.prefixFacture;

      const nextNum = generateNextDocumentNumber(targetType, data.documents, prefix);
      const today = new Date().toISOString().split('T')[0];

      const newDoc: CommercialDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: targetType,
        numero: nextNum,
        dateEmission: today, // Date du jour
        statut: targetType === 'facture' ? 'a_payer' : targetType === 'bon_commande' ? 'confirme' : 'brouillon',
        client: { ...source.client },
        lignes: source.lignes.map((l) => ({
          ...l,
          id: `lig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        })),
        modeReglement: source.modeReglement,
        notes: source.notes,
        sourceDocumentNumero: source.numero,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Met à jour le document d'origine
      let sourceUpdate: Partial<CommercialDocument> = {
        convertedToDocumentNumero: newDoc.numero,
      };
      if (source.type === 'devis') sourceUpdate.statut = 'accepte';
      if (source.type === 'bon_commande') sourceUpdate.statut = 'confirme';

      setData((prev) => ({
        ...prev,
        documents: [
          newDoc,
          ...prev.documents.map((d) => (d.id === sourceDocId ? { ...d, ...sourceUpdate } : d)),
        ],
      }));

      setActiveTab(targetType);
      setEditingDocument(newDoc);
      return newDoc;
    },
    [data.documents, data.company]
  );

  // Settings
  const updateCompany = useCallback((updates: Partial<CompanySettings>) => {
    setData((prev) => ({
      ...prev,
      company: { ...prev.company, ...updates },
    }));
  }, []);

  const setCompanyLogo = useCallback((logoBase64: string) => {
    setData((prev) => ({
      ...prev,
      company: { ...prev.company, logoUrl: logoBase64 },
    }));
  }, []);

  const setThemeColor = useCallback((colorHex: string, presetId?: string) => {
    const matched = THEME_PRESETS.find((p) => p.primary.toLowerCase() === colorHex.toLowerCase());
    setData((prev) => ({
      ...prev,
      theme: {
        currentColor: colorHex,
        presetId: presetId || (matched ? matched.id : 'custom'),
      },
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    if (window.confirm('Voulez-vous réinitialiser toutes les données aux valeurs de base ?')) {
      setData(INITIAL_APP_DATA);
      saveAppData(INITIAL_APP_DATA);
      setLastSaved(new Date());
    }
  }, []);

  const exportBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gestapp-facture-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importBackup = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.documents || !parsed.company) return false;
      setData(parsed);
      saveAppData(parsed);
      setLastSaved(new Date());
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        data,
        activeTab,
        setActiveTab,
        lastSaved,
        saveStatus,
        todayDate,

        addDocument,
        updateDocument,
        deleteDocument,
        duplicateDocument,
        convertDocument,

        editingDocument,
        setEditingDocument,
        printingDocument,
        setPrintingDocument,

        updateCompany,
        setCompanyLogo,
        setThemeColor,
        themeModalOpen,
        setThemeModalOpen,
        resetToDefaults,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp doit être utilisé dans AppProvider');
  return context;
};
