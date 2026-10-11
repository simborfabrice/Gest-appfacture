import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { THEME_PRESETS } from '../constants/themes';
import {
  Building2,
  CreditCard,
  FileCode,
  Palette,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  Save,
  Check,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    data,
    updateCompany,
    setThemeColor,
    resetToDefaults,
    exportBackup,
    importBackup,
    lastSaved,
  } = useApp();

  const [companyForm, setCompanyForm] = useState(data.company);
  const [customHex, setCustomHex] = useState(data.theme.currentColor);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleCompanyChange = (field: keyof typeof companyForm, value: string) => {
    const updated = { ...companyForm, [field]: value };
    setCompanyForm(updated);
    updateCompany({ [field]: value });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setThemeColor(hex, 'custom');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackup(content);
        if (ok) {
          alert('Sauvegarde restaurée avec succès !');
        } else {
          alert('Le fichier sélectionné n’est pas une sauvegarde valide.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Paramètres de votre Entreprise & Thème
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Vos informations légales, coordonnées bancaires, numérotation et couleurs personnalisées
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Enregistré automatiquement</span>
            </span>
          )}
        </div>
      </div>

      {/* Section 1: Thème de couleur personnalisé */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: data.theme.currentColor }}
          >
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Thème de couleur à volonté</h3>
            <p className="text-xs text-slate-500">
              Harmonisez l'interface et vos documents commerciaux à vos couleurs de marque
            </p>
          </div>
        </div>

        {/* Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Palettes recommandées
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {THEME_PRESETS.map((p) => {
              const isSelected = data.theme.currentColor.toLowerCase() === p.primary.toLowerCase();
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setCustomHex(p.primary);
                    setThemeColor(p.primary, p.id);
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 shadow-2xs ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-2xs shrink-0"
                    style={{ backgroundColor: p.primary }}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium text-slate-800 line-clamp-1">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Hex Selector */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            <span className="font-semibold block text-slate-800">Couleur exacte sur mesure :</span>
            <span>Sélectionnez votre code hexadécimal précis</span>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="color"
              value={customHex}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white shadow-xs"
            />
            <input
              type="text"
              value={customHex}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="w-24 px-2 py-1.5 text-xs font-mono text-slate-800 uppercase bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400"
              placeholder="#2563EB"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Identité de l'entreprise */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Informations de votre entreprise</h3>
            <p className="text-xs text-slate-500">
              Ces coordonnées figurent sur l'en-tête de vos devis, bons de commande et factures
            </p>
          </div>
        </div>

        {/* Option de Logo supplémentaire pour l'en-tête des documents à imprimer */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {companyForm.logoUrl ? (
              <div className="relative group">
                <img
                  src={companyForm.logoUrl}
                  alt="Logo entreprise"
                  className="w-16 h-16 object-contain bg-white rounded-lg border border-slate-300 p-1"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400">
                <Building2 className="w-6 h-6" />
                <span className="text-[9px] mt-0.5">Aucun logo</span>
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-slate-900">
                Logo supplémentaire de votre société
              </div>
              <div className="text-[11px] text-slate-500">
                Ce logo figurera dans l'en-tête de vos devis, bons de commande et factures imprimés
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer transition-colors shadow-2xs">
              <Upload className="w-3.5 h-3.5" />
              <span>{companyForm.logoUrl ? 'Remplacer le logo' : 'Choisir une image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64 = event.target?.result as string;
                      if (base64) {
                        handleCompanyChange('logoUrl', base64);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>

            {companyForm.logoUrl && (
              <button
                type="button"
                onClick={() => handleCompanyChange('logoUrl', '')}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Supprimer le logo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nom ou Raison sociale
            </label>
            <input
              type="text"
              value={companyForm.nom}
              onChange={(e) => handleCompanyChange('nom', e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Slogan ou Activité principale
            </label>
            <input
              type="text"
              value={companyForm.slogan || ''}
              onChange={(e) => handleCompanyChange('slogan', e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Forme juridique & Capital
            </label>
            <input
              type="text"
              placeholder="Ex : SAS au capital de 10 000 €"
              value={companyForm.formeJuridique}
              onChange={(e) => handleCompanyChange('formeJuridique', e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              SIRET
            </label>
            <input
              type="text"
              value={companyForm.siret}
              onChange={(e) => handleCompanyChange('siret', e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Numéro de TVA Intracommunautaire
            </label>
            <input
              type="text"
              value={companyForm.numeroTva}
              onChange={(e) => handleCompanyChange('numeroTva', e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Adresse postale
            </label>
            <input
              type="text"
              value={companyForm.adresse}
              onChange={(e) => handleCompanyChange('adresse', e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Code postal
              </label>
              <input
                type="text"
                value={companyForm.codePostal}
                onChange={(e) => handleCompanyChange('codePostal', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ville
              </label>
              <input
                type="text"
                value={companyForm.ville}
                onChange={(e) => handleCompanyChange('ville', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Téléphone
              </label>
              <input
                type="text"
                value={companyForm.telephone}
                onChange={(e) => handleCompanyChange('telephone', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email de contact
              </label>
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => handleCompanyChange('email', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Coordonnées Bancaires & Mentions Légales */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Banque, IBAN & Mentions obligatoires
            </h3>
            <p className="text-xs text-slate-500">
              Coordonnées de virement bancaire et mentions légales de recouvrement
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              IBAN
            </label>
            <input
              type="text"
              value={companyForm.iban}
              onChange={(e) => handleCompanyChange('iban', e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              BIC (SWIFT) & Banque
            </label>
            <input
              type="text"
              value={companyForm.bic}
              onChange={(e) => handleCompanyChange('bic', e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Mentions légales au pied de page des factures
          </label>
          <textarea
            rows={3}
            value={companyForm.mentionsLegales}
            onChange={(e) => handleCompanyChange('mentionsLegales', e.target.value)}
            className="w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-slate-400 leading-relaxed"
          />
          <p className="text-[11px] text-slate-600 mt-1">
            Mention légale obligatoire en France : pénalités de retard et indemnité forfaitaire pour frais de recouvrement de 40 € (art. L.441-6 du Code de commerce).
          </p>
        </div>
      </div>

      {/* Section 4: Préfixes de numérotation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Préfixes de numérotation</h3>
            <p className="text-xs text-slate-500">
              Format séquentiel appliqué lors de la création de nouveaux documents
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Préfixe Devis
            </label>
            <input
              type="text"
              value={companyForm.prefixDevis}
              onChange={(e) => handleCompanyChange('prefixDevis', e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white"
            />
            <span className="text-[11px] text-slate-600 font-mono mt-1 block">
              Ex : {companyForm.prefixDevis}2026-001
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Préfixe Bon de Commande
            </label>
            <input
              type="text"
              value={companyForm.prefixBonCommande}
              onChange={(e) => handleCompanyChange('prefixBonCommande', e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white"
            />
            <span className="text-[11px] text-slate-600 font-mono mt-1 block">
              Ex : {companyForm.prefixBonCommande}2026-001
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Préfixe Facture
            </label>
            <input
              type="text"
              value={companyForm.prefixFacture}
              onChange={(e) => handleCompanyChange('prefixFacture', e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white"
            />
            <span className="text-[11px] text-slate-600 font-mono mt-1 block">
              Ex : {companyForm.prefixFacture}2026-001
            </span>
          </div>
        </div>
      </div>

      {/* Section 5: Sauvegarde & Sécurité des données */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Sauvegarde & Restauration</h3>
          <p className="text-xs text-slate-500">
            Toutes vos données sont automatiquement enregistrées en continu dans votre navigateur
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={exportBackup}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exporter la sauvegarde (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Importer une sauvegarde</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>

          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les données d'exemple</span>
          </button>
        </div>
      </div>
    </div>
  );
};
