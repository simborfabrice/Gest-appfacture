import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { DocumentList } from './components/DocumentList';
import { SettingsView } from './components/SettingsView';
import { DocumentEditorModal } from './components/DocumentEditorModal';
import { DocumentPrintView } from './components/DocumentPrintView';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* En-tête avec logo Gest'App facture */}
      <Header />

      {/* Contenu principal selon l'onglet actif : Devis, Bon de commande, Facturation, Paramètres */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'devis' && <DocumentList type="devis" />}
        {activeTab === 'bon_commande' && <DocumentList type="bon_commande" />}
        {activeTab === 'facture' && <DocumentList type="facture" />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Pied de page sobre */}
      <footer className="border-t border-slate-200/80 bg-white py-3.5 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Gest’App facture</span>
            <span>·</span>
            <span>Devis, Bons de commande & Factures simples</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-700 font-medium">Sauvegarde automatique continue</span>
          </div>
        </div>
      </footer>

      {/* Modales */}
      <DocumentEditorModal />
      <DocumentPrintView />
      <ThemeSelectorModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
