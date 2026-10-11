import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { THEME_PRESETS, deriveThemeColors } from '../constants/themes';
import { Palette, Check, Sparkles, X } from 'lucide-react';

export const ThemeSelectorModal: React.FC = () => {
  const { data, setThemeColor, themeModalOpen, setThemeModalOpen } = useApp();
  const [customHex, setCustomHex] = useState(data.theme.currentColor || '#2563eb');

  if (!themeModalOpen) return null;

  const currentTheme = deriveThemeColors(data.theme.currentColor);

  const handleSelectPreset = (hex: string, id: string) => {
    setCustomHex(hex);
    setThemeColor(hex, id);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomHex(hex);
    setThemeColor(hex, 'custom');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: data.theme.currentColor }}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Personnaliser le thème de couleur</h3>
              <p className="text-xs text-slate-500">Choisissez votre couleur préférée ou personnalisez à volonté</p>
            </div>
          </div>
          <button
            onClick={() => setThemeModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Presets Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
              Palettes recommandées
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {THEME_PRESETS.map((preset) => {
                const isSelected =
                  data.theme.currentColor.toLowerCase() === preset.primary.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.primary, preset.id)}
                    className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50/80 ring-2 ring-slate-900/10 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full mb-2 flex items-center justify-center text-white shadow-xs relative"
                      style={{ backgroundColor: preset.primary }}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-medium text-slate-800 line-clamp-1">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom color picker */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Couleur sur mesure (au choix)
                </label>
                <span className="text-xs text-slate-500">Sélectionnez n'importe quelle nuance</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customHex}
                  onChange={handleCustomColorChange}
                  className="w-9 h-9 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white shadow-xs"
                />
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomHex(val);
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      setThemeColor(val, 'custom');
                    }
                  }}
                  className="w-24 px-2 py-1 text-xs font-mono text-slate-700 uppercase bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-slate-400"
                  placeholder="#2563EB"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Sample Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: currentTheme.primary }} />
                Aperçu en temps réel
              </span>
              <span className="text-xs font-mono text-slate-600">{currentTheme.primary}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs"
                style={{ backgroundColor: currentTheme.primary }}
              >
                Bouton principal
              </button>
              <button
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border"
                style={{
                  borderColor: currentTheme.primary,
                  color: currentTheme.primary,
                  backgroundColor: currentTheme.light,
                }}
              >
                Bouton secondaire
              </button>
              <div
                className="px-2.5 py-1 rounded-md text-xs font-medium"
                style={{ backgroundColor: currentTheme.light, color: currentTheme.primary }}
              >
                Badge d'accent
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            onClick={() => setThemeModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors"
            style={{ backgroundColor: data.theme.currentColor }}
          >
            Appliquer et fermer
          </button>
        </div>
      </div>
    </div>
  );
};
