import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CommercialDocument, LineItem, Client } from '../types';
import {
  calculateDocumentSummary,
  calculateLineTotals,
  formatCurrency,
  getDocumentTypeLabel,
} from '../utils/formatters';
import {
  X,
  Plus,
  Trash2,
  Printer,
  Eye,
  ArrowRight,
  CheckCircle,
  Copy,
  ShoppingCart,
  Receipt,
  User,
  Calendar,
} from 'lucide-react';

export const DocumentEditorModal: React.FC = () => {
  const {
    editingDocument,
    setEditingDocument,
    updateDocument,
    convertDocument,
    setPrintingDocument,
    duplicateDocument,
    data,
    todayDate,
  } = useApp();

  const [doc, setDoc] = useState<CommercialDocument | null>(editingDocument);

  useEffect(() => {
    setDoc(editingDocument);
  }, [editingDocument]);

  if (!doc) return null;

  const summary = calculateDocumentSummary(doc);

  const handleFieldChange = (field: keyof CommercialDocument, value: any) => {
    const updated = { ...doc, [field]: value };
    setDoc(updated);
    updateDocument(doc.id, { [field]: value });
  };

  // Saisie instantanée des informations client
  const handleClientFieldChange = (field: keyof Client, value: string) => {
    const updatedClient = { ...doc.client, [field]: value };
    const updated = { ...doc, client: updatedClient };
    setDoc(updated);
    updateDocument(doc.id, { client: updatedClient });
  };

  // Saisie instantanée des désignations
  const handleLineChange = (lineId: string, field: keyof LineItem, value: any) => {
    const updatedLines = doc.lignes.map((l) => {
      if (l.id === lineId) {
        return { ...l, [field]: value };
      }
      return l;
    });
    const updated = { ...doc, lignes: updatedLines };
    setDoc(updated);
    updateDocument(doc.id, { lignes: updatedLines });
  };

  const handleAddLine = () => {
    const newLine: LineItem = {
      id: `lig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      designation: '',
      quantite: 1,
      prixUnitaireHT: 0,
      tauxTVA: 20,
    };
    const updatedLines = [...doc.lignes, newLine];
    const updated = { ...doc, lignes: updatedLines };
    setDoc(updated);
    updateDocument(doc.id, { lignes: updatedLines });
  };

  const handleDeleteLine = (lineId: string) => {
    if (doc.lignes.length <= 1) {
      const resetLine: LineItem = {
        id: `lig-${Date.now()}`,
        designation: '',
        quantite: 1,
        prixUnitaireHT: 0,
        tauxTVA: 20,
      };
      const updated = { ...doc, lignes: [resetLine] };
      setDoc(updated);
      updateDocument(doc.id, { lignes: [resetLine] });
      return;
    }
    const updatedLines = doc.lignes.filter((l) => l.id !== lineId);
    const updated = { ...doc, lignes: updatedLines };
    setDoc(updated);
    updateDocument(doc.id, { lignes: updatedLines });
  };

  const handleConvert = (targetType: 'bon_commande' | 'facture') => {
    const targetLabel = targetType === 'bon_commande' ? 'un bon de commande' : 'une facture';
    if (window.confirm(`Voulez-vous transformer ce ${getDocumentTypeLabel(doc.type)} en ${targetLabel} ?`)) {
      convertDocument(doc.id, targetType);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-6 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-98 duration-150">
        {/* En-tête de l'éditeur */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <span
              className="px-2.5 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider"
              style={{ backgroundColor: data.theme.currentColor }}
            >
              {getDocumentTypeLabel(doc.type)}
            </span>
            <input
              type="text"
              value={doc.numero}
              onChange={(e) => handleFieldChange('numero', e.target.value)}
              className="font-mono font-bold text-sm text-slate-800 bg-white border border-slate-300 rounded px-2 py-0.5 w-36 focus:outline-hidden"
              title="Numéro de document modifiable"
            />
            {doc.sourceDocumentNumero && (
              <span className="text-xs text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                Origine : {doc.sourceDocumentNumero}
              </span>
            )}
          </div>

          {/* Boutons d'action et conversion */}
          <div className="flex items-center gap-2">
            {/* Conversion 1-clic */}
            {doc.type === 'devis' && (
              <button
                onClick={() => handleConvert('bon_commande')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                title="Transformer ce devis en bon de commande"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Passer en bon de commande</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {doc.type === 'bon_commande' && (
              <button
                onClick={() => handleConvert('facture')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                title="Transformer ce bon de commande en facture"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Passer en facture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Visualiser le document à imprimer */}
            <button
              onClick={() => setPrintingDocument(doc)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-2xs"
              title="Visualiser le document avant impression ou export PDF"
            >
              <Eye className="w-3.5 h-3.5 text-purple-700" />
              <span>Visualiser & Imprimer</span>
            </button>

            {/* Dupliquer */}
            <button
              onClick={() => duplicateDocument(doc.id)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Dupliquer"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Fermer */}
            <button
              onClick={() => setEditingDocument(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulaire du document */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Ligne Dates (Ouverture à la date du jour) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Date d'émission (date du jour)</span>
              </label>
              <input
                type="date"
                value={doc.dateEmission || todayDate}
                onChange={(e) => handleFieldChange('dateEmission', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {doc.type === 'devis'
                  ? 'Date de fin de validité'
                  : doc.type === 'bon_commande'
                  ? 'Date de livraison prévue'
                  : 'Date limite de paiement'}
              </label>
              <input
                type="date"
                value={doc.dateEcheance || ''}
                onChange={(e) => handleFieldChange('dateEcheance', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* CASE CLIENT : Saisie instantanée de toutes les informations */}
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-800" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Case Client (Saisie instantanée)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                Saisissez les coordonnées du client ci-dessous
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Nom du client ou Entreprise *
                </label>
                <input
                  type="text"
                  placeholder="Ex : Société Dupont ou Claire Martin"
                  value={doc.client.entreprise || doc.client.nom || ''}
                  onChange={(e) => {
                    handleClientFieldChange('entreprise', e.target.value);
                    handleClientFieldChange('nom', e.target.value);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Adresse de facturation
                </label>
                <input
                  type="text"
                  placeholder="Ex : 14 Boulevard Haussmann, 75009 Paris"
                  value={doc.client.adresse || ''}
                  onChange={(e) => handleClientFieldChange('adresse', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="contact@client.fr"
                  value={doc.client.email || ''}
                  onChange={(e) => handleClientFieldChange('email', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Téléphone
                </label>
                <input
                  type="tel"
                  placeholder="01 42 68 55 90"
                  value={doc.client.telephone || ''}
                  onChange={(e) => handleClientFieldChange('telephone', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  SIRET ou N° TVA (facultatif)
                </label>
                <input
                  type="text"
                  placeholder="Ex : 839 214 789 00012"
                  value={doc.client.siret || ''}
                  onChange={(e) => handleClientFieldChange('siret', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* DÉSIGNATIONS : Saisie instantanée des lignes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Désignations & Articles (Saisie instantanée)
              </h4>
              <button
                onClick={handleAddLine}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white rounded-lg shadow-2xs hover:opacity-95 transition-opacity"
                style={{ backgroundColor: data.theme.currentColor }}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Ajouter une désignation</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">Désignation</th>
                    <th className="py-2.5 px-2 w-20 text-center">Quantité</th>
                    <th className="py-2.5 px-2 w-28 text-right">Prix Unit. HT (€)</th>
                    <th className="py-2.5 px-2 w-20 text-center">TVA</th>
                    <th className="py-2.5 px-3 w-28 text-right">Total HT</th>
                    <th className="py-2.5 px-2 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doc.lignes.map((line) => {
                    const lineTotals = calculateLineTotals(line);
                    return (
                      <tr key={line.id} className="hover:bg-slate-50/60">
                        {/* Désignation en saisie libre immédiate */}
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Saisissez votre désignation..."
                            value={line.designation}
                            onChange={(e) => handleLineChange(line.id, 'designation', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-400"
                          />
                        </td>

                        {/* Quantité */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={line.quantite}
                            onChange={(e) =>
                              handleLineChange(line.id, 'quantite', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1.5 text-xs text-center font-mono border border-slate-200 rounded-md"
                          />
                        </td>

                        {/* Prix Unit HT */}
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.prixUnitaireHT}
                            onChange={(e) =>
                              handleLineChange(
                                line.id,
                                'prixUnitaireHT',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-2 py-1.5 text-xs text-right font-mono font-bold border border-slate-200 rounded-md"
                          />
                        </td>

                        {/* TVA */}
                        <td className="p-2">
                          <select
                            value={line.tauxTVA}
                            onChange={(e) =>
                              handleLineChange(line.id, 'tauxTVA', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-1 py-1.5 text-xs text-center font-mono border border-slate-200 rounded-md bg-white"
                          >
                            <option value="20">20%</option>
                            <option value="10">10%</option>
                            <option value="5.5">5.5%</option>
                            <option value="0">0%</option>
                          </select>
                        </td>

                        {/* Total HT */}
                        <td className="p-2 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatCurrency(lineTotals.totalHT, data.company.devise)}
                        </td>

                        {/* Supprimer */}
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDeleteLine(line.id)}
                            className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                            title="Supprimer la ligne"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bas du document : Notes & Totaux simples */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes ou conditions
              </label>
              <textarea
                rows={3}
                placeholder="Ex : Paiement par virement bancaire sous 30 jours..."
                value={doc.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white"
              />
            </div>

            {/* Totaux simples */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Total HT :</span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatCurrency(summary.totalHT, data.company.devise)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Total TVA :</span>
                <span className="font-mono font-semibold tabular-nums">
                  {formatCurrency(summary.totalTVA, data.company.devise)}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-300">
                <span className="text-sm font-bold text-slate-900">Total Net TTC :</span>
                <span
                  className="text-xl font-bold font-mono tabular-nums"
                  style={{ color: data.theme.currentColor }}
                >
                  {formatCurrency(summary.totalTTC, data.company.devise)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de l'éditeur */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Sauvegardé automatiquement</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingDocument(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => setPrintingDocument(doc)}
              className="px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95 transition-opacity flex items-center gap-1.5"
              style={{ backgroundColor: data.theme.currentColor }}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visualiser & Imprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
