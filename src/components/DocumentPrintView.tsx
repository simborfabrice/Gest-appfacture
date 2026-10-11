import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateDocumentSummary,
  calculateLineTotals,
  formatCurrency,
  formatDate,
  getDocumentTypeLabel,
} from '../utils/formatters';
import { Printer, X, ArrowLeft, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';

export const DocumentPrintView: React.FC = () => {
  const { printingDocument, setPrintingDocument, data, setCompanyLogo } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!printingDocument) return null;

  const doc = printingDocument;
  const summary = calculateDocumentSummary(doc);
  const company = data.company;
  const client = doc.client;
  const primaryColor = data.theme.currentColor || '#2563eb';

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCompanyLogo(base64);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    setCompanyLogo('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Barre d'action supérieure (masquée à l'impression) */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between bg-white px-5 py-3 rounded-xl mb-4 shadow-lg border border-slate-200 print:hidden gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrintingDocument(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'édition</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-medium text-slate-600">
              Visualisation avant impression · {getDocumentTypeLabel(doc.type)} {doc.numero}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Bouton pour ajouter ou modifier le logo de la société */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
              title="Ajouter un logo d'entreprise pour l'en-tête de ce document"
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-700" />
              <span>{company.logoUrl ? 'Changer le logo société' : '+ Logo société en-tête'}</span>
            </button>

            {company.logoUrl && (
              <button
                onClick={handleRemoveLogo}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Supprimer le logo supplémentaire de la société"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Imprimer / PDF */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-md hover:opacity-95 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </button>

            <button
              onClick={() => setPrintingDocument(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visualisation A4 du Document Imprimé */}
        <div
          id="printable-document"
          className="w-full bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 border border-slate-200 print:border-none print:shadow-none print:rounded-none print:p-0 min-h-[29.7cm] flex flex-col justify-between"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          <div>
            {/* En-tête : Logo Société (optionnel) + Nom de la société + Destinataire */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8 gap-6">
              {/* Entreprise émettrice avec Option de Logo supplémentaire */}
              <div className="space-y-2 max-w-sm">
                <div className="flex items-center gap-3">
                  {/* Logo supplémentaire pour l'en-tête (si importé par l'utilisateur) */}
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.nom}
                      className="max-h-16 max-w-[140px] object-contain rounded-md"
                    />
                  ) : null}

                  <div>
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">
                      {company.nom}
                    </h1>
                    {company.slogan && (
                      <p className="text-[11px] text-slate-500">{company.slogan}</p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed pt-1">
                  <div>{company.adresse}</div>
                  <div>
                    {company.codePostal} {company.ville}
                  </div>
                  {company.telephone && <div>Tél : {company.telephone}</div>}
                  {company.email && <div>Email : {company.email}</div>}
                  <div className="pt-1 text-[11px] text-slate-500 font-mono">
                    SIRET : {company.siret}
                  </div>
                  {company.numeroTva && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      N° TVA : {company.numeroTva}
                    </div>
                  )}
                </div>
              </div>

              {/* Titre Document & Case Client imprimée */}
              <div className="flex flex-col items-end text-right space-y-4">
                <div>
                  <span
                    className="inline-block px-3 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider mb-1"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {getDocumentTypeLabel(doc.type)}
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                    {doc.numero}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Date d'émission : <span className="font-semibold font-mono">{formatDate(doc.dateEmission)}</span>
                  </div>
                  {doc.dateEcheance && (
                    <div className="text-xs text-slate-600">
                      {doc.type === 'devis' ? 'Validité jusqu’au : ' : 'Date d’échéance : '}
                      <span className="font-semibold font-mono">{formatDate(doc.dateEcheance)}</span>
                    </div>
                  )}
                </div>

                {/* Case Client fidèle à la saisie instantanée */}
                <div className="w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Client
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {client.entreprise || client.nom || 'Client'}
                  </div>
                  {client.adresse && (
                    <div className="text-xs text-slate-600">{client.adresse}</div>
                  )}
                  {client.email && <div className="text-xs text-slate-600">{client.email}</div>}
                  {client.telephone && (
                    <div className="text-xs text-slate-600">{client.telephone}</div>
                  )}
                  {client.siret && (
                    <div className="text-[11px] font-mono text-slate-500 pt-0.5">
                      SIRET : {client.siret}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tableau des lignes / désignations */}
            <div className="mb-8">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr
                    className="text-white uppercase text-[10px] tracking-wider font-semibold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <th className="py-2.5 px-3 rounded-l-md">Désignation</th>
                    <th className="py-2.5 px-2 text-center w-16">Qté</th>
                    <th className="py-2.5 px-2 text-right w-28">Prix Unit. HT</th>
                    <th className="py-2.5 px-2 text-center w-16">TVA</th>
                    <th className="py-2.5 px-3 text-right w-28 rounded-r-md">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {doc.lignes.map((line, idx) => {
                    const lineTotals = calculateLineTotals(line);
                    return (
                      <tr key={line.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {line.designation || 'Prestation'}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-medium">
                          {line.quantite}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono">
                          {formatCurrency(line.prixUnitaireHT, company.devise)}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                          {line.tauxTVA} %
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(lineTotals.totalHT, company.devise)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totaux & Règlement */}
            <div className="grid grid-cols-12 gap-8 mb-8 items-start">
              {/* Gauche : Règlement et Signature */}
              <div className="col-span-7 space-y-4">
                {company.iban && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                      Coordonnées bancaires
                    </div>
                    <div className="font-mono text-[11px] text-slate-700">
                      IBAN : <span className="font-semibold">{company.iban}</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-700">
                      BIC : <span className="font-semibold">{company.bic}</span>
                    </div>
                  </div>
                )}

                {doc.notes && (
                  <div className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    "{doc.notes}"
                  </div>
                )}

                {(doc.type === 'devis' || doc.type === 'bon_commande') && (
                  <div className="border border-dashed border-slate-300 rounded-xl p-4 text-xs space-y-2 mt-4">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      Bon pour accord
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Date et signature avec la mention manuscrite « Bon pour accord » :
                    </div>
                    <div className="h-16 flex items-end">
                      <span className="text-[10px] text-slate-400">Signature :</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Droite : Récapitulatif simple */}
              <div className="col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Total HT :</span>
                  <span className="font-mono tabular-nums font-semibold">
                    {formatCurrency(summary.totalHT, company.devise)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Total TVA :</span>
                  <span className="font-mono tabular-nums font-semibold">
                    {formatCurrency(summary.totalTVA, company.devise)}
                  </span>
                </div>

                <div
                  className="flex justify-between text-sm font-bold pt-2 border-t-2 text-white p-2.5 rounded-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>TOTAL TTC :</span>
                  <span className="font-mono tabular-nums text-base">
                    {formatCurrency(summary.totalTTC, company.devise)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mentions légales de bas de page */}
          <div className="border-t border-slate-200 pt-6 mt-8 text-center text-[10px] text-slate-500 leading-relaxed space-y-1">
            <div>
              {company.nom} · SIRET {company.siret} · TVA {company.numeroTva}
            </div>
            <div>{company.mentionsLegales}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
