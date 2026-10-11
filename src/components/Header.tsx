import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GestAppLogo } from './GestAppLogo';
import {
  FileText,
  ShoppingCart,
  Receipt,
  Settings,
  Palette,
  CheckCircle2,
  Plus,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import { DocumentType } from '../types';

export const Header: React.FC = () => {
  const {
    data,
    activeTab,
    setActiveTab,
    lastSaved,
    saveStatus,
    addDocument,
    setThemeModalOpen,
  } = useApp();

  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCreateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const countDevis = data.documents.filter((d) => d.type === 'devis').length;
  const countBC = data.documents.filter((d) => d.type === 'bon_commande').length;
  const countFactures = data.documents.filter((d) => d.type === 'facture').length;

  // Format date du jour
  const todayFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleCreateDocument = (type: DocumentType) => {
    setCreateDropdownOpen(false);
    addDocument(type);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Gest'App en haut à gauche (FIXE, NON MODIFIABLE) */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setActiveTab('devis')}
              className="text-left focus:outline-hidden"
              title="Gest'App facture - Logo officiel"
            >
              <GestAppLogo size="md" />
            </button>

            {/* Date du jour & Statut de sauvegarde */}
            <div className="hidden lg:flex items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200/60 font-medium capitalize">
                <Calendar className="w-3.5 h-3.5 text-purple-700" />
                <span>{todayFormatted}</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500">
                {saveStatus === 'saving' ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sauvegarde auto</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Les 3 onglets uniques : Devis, Bons de commande, Facturation (PAS D'ONGLET CLIENT) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('devis')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'devis'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Devis</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                {countDevis}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bon_commande')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'bon_commande'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bons de commande</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                {countBC}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('facture')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'facture'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>Facturation</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                {countFactures}
              </span>
            </button>
          </nav>

          {/* Actions : Thème, Paramètres & Création */}
          <div className="flex items-center gap-2.5">
            {/* Sélecteur de couleur */}
            <button
              onClick={() => setThemeModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
              title="Changer le thème de couleur à volonté"
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                style={{ backgroundColor: data.theme.currentColor }}
              />
              <span className="hidden sm:inline">Thème</span>
              <Palette className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Paramètres & Logo entreprise */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-lg border transition-colors ${
                activeTab === 'settings'
                  ? 'border-slate-400 bg-slate-100 text-slate-900'
                  : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Paramètres de l'entreprise & logo d'en-tête"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Nouveau document */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCreateDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95 transition-all"
                style={{ backgroundColor: data.theme.currentColor }}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="whitespace-nowrap">Nouveau</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {createDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <button
                    onClick={() => handleCreateDocument('devis')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-slate-900">Nouveau Devis</span>
                  </button>
                  <button
                    onClick={() => handleCreateDocument('bon_commande')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <ShoppingCart className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-slate-900">Nouveau Bon de commande</span>
                  </button>
                  <button
                    onClick={() => handleCreateDocument('facture')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-slate-900">Nouvelle Facture</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barre mobile (Devis, BC, Facturation) */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => setActiveTab('devis')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'devis' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Devis ({countDevis})
          </button>
          <button
            onClick={() => setActiveTab('bon_commande')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'bon_commande' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Bons de commande ({countBC})
          </button>
          <button
            onClick={() => setActiveTab('facture')}
            className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'facture' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Facturation ({countFactures})
          </button>
        </div>
      </div>
    </header>
  );
};
