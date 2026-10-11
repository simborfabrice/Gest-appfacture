import { AppData } from '../types';
import { INITIAL_APP_DATA } from '../constants/seedData';

const STORAGE_KEY = 'gestapp_facture_simple_data';

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_APP_DATA;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      documents: Array.isArray(parsed.documents) ? parsed.documents : INITIAL_APP_DATA.documents,
      clients: Array.isArray(parsed.clients) ? parsed.clients : INITIAL_APP_DATA.clients,
      company: parsed.company ? { ...INITIAL_APP_DATA.company, ...parsed.company } : INITIAL_APP_DATA.company,
      theme: parsed.theme ? { ...INITIAL_APP_DATA.theme, ...parsed.theme } : INITIAL_APP_DATA.theme,
    };
  } catch (err) {
    console.error('Erreur chargement données:', err);
    return INITIAL_APP_DATA;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Erreur sauvegarde:', err);
  }
}
