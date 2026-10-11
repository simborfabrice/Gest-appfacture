import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentType, CommercialDocument } from '../types';
import {
  calculateDocumentSummary,
  formatCurrency,
  formatDate,
  getDocumentTypeLabel,
  getDocumentTypePluralLabel,
} from '../utils/formatters';
import {
  Plus,
  Search,
  Printer,
  Trash2,
  ShoppingCart,
  Receipt,
  FileText,
  Eye,
} from 'lucide-react';

interface DocumentListProps {
  type: DocumentType;
}

export const DocumentList: React.FC<DocumentListProps> = ({ type }) => {
  const {
    data,
    setEditingDocument,
    addDocument,
    setPrintingDocument,
    convertDocument,
    deleteDocument,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  const documentsOfType = useMemo(() => {
    return data.documents.filter((d) => d.type === type);
  }, [data.documents, type]);

  const filteredDocuments = useMemo(() => {
    return documentsOfType.filter((doc) => {
      const q = searchTerm.toLowerCase();
      return (
        doc.numero.toLowerCase().includes(q) ||
        (doc.client?.nom && doc.client.nom.toLowerCase().includes(q)) ||
        (doc.client?.entreprise && doc.client.entreprise.toLowerCase().includes(q)) ||
        doc.lignes.some((l) => l.designation.toLowerCase().includes(q))
      );
    });
  }, [documentsOfType, searchTerm]);

  const handleDelete = (doc: CommercialDocument) => {
    if (confirm(`Supprimer ${getDocumentTypeLabel(type)} ${doc.numero} ?`)) {
      deleteDocument(doc.id);
    }
  };

  const handleConvert = (doc: CommercialDocument, targetType: DocumentType) => {
    const targetLabel = targetType === 'bon_commande' ? 'un bon de commande' : 'une facture';
    if (confirm(`Transformer ${doc.numero} en ${targetLabel} ?`)) {
      convertDocument(doc.id, targetType);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Barre supérieure : Titre et Nouveau Document */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{getDocumentTypePluralLabel(type)}</span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {documentsOfType.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Recherche compacte */}
          <div className="relative w-44 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => addDocument(type)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95 transition-all whitespace-nowrap"
            style={{ backgroundColor: data.theme.currentColor }}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nouveau {getDocumentTypeLabel(type)}</span>
          </button>
        </div>
      </div>

      {/* Tableau compact qui ne dépasse JAMAIS l'écran */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden w-full">
        {filteredDocuments.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-semibold text-slate-700">
              Aucun {getDocumentTypeLabel(type).toLowerCase()} enregistré
            </div>
            <button
              onClick={() => addDocument(type)}
              className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs hover:opacity-95"
              style={{ backgroundColor: data.theme.currentColor }}
            >
              + Créer un {getDocumentTypeLabel(type)}
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 w-32">Numéro</th>
                <th className="py-2.5 px-3 w-28">Date</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3 text-right w-28">Total TTC</th>
                <th className="py-2.5 px-3 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocuments.map((doc) => {
                const summary = calculateDocumentSummary(doc);
                const clientName =
                  doc.client?.entreprise || doc.client?.nom || 'Client sans nom';

                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => setEditingDocument(doc)}
                    title="Cliquez pour ouvrir et modifier ce document"
                  >
                    {/* Numéro */}
                    <td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {doc.numero}
                      {doc.sourceDocumentNumero && (
                        <div className="text-[9px] text-slate-400 font-normal">
                          De {doc.sourceDocumentNumero}
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {formatDate(doc.dateEmission)}
                    </td>

                    {/* Client */}
                    <td className="py-2 px-3 font-semibold text-slate-800 truncate max-w-xs">
                      {clientName}
                    </td>

                    {/* Total TTC */}
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
                      {formatCurrency(summary.totalTTC, data.company.devise)}
                    </td>

                    {/* Actions Raccourcies pour ne pas dépasser de l'écran */}
                    <td
                      className="py-2 px-3 text-center whitespace-nowrap w-28"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {/* Bouton de conversion ultra compact */}
                        {doc.type === 'devis' && (
                          <button
                            onClick={() => handleConvert(doc, 'bon_commande')}
                            className="px-2 py-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors"
                            title="Convertir ce devis en bon de commande"
                          >
                            → BC
                          </button>
                        )}

                        {doc.type === 'bon_commande' && (
                          <button
                            onClick={() => handleConvert(doc, 'facture')}
                            className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                            title="Convertir ce bon de commande en facture"
                          >
                            → Fac
                          </button>
                        )}

                        {/* Visualiser / Imprimer */}
                        <button
                          onClick={() => setPrintingDocument(doc)}
                          className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
                          title="Visualiser et imprimer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Supprimer */}
                        <button
                          onClick={() => handleDelete(doc)}
                          className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
