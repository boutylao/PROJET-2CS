// mockData.ts - Données provisoires pour tester le composant ImportationRapport
// Ce fichier permet de simuler les données qui seraient normalement gérées par l'état du composant
export interface RapportData {
  site: string;
  date: string;
  heure: string;
  fichier: string;
  problemes: string;
  donneesValides: boolean;
}

// Données par défaut pour initialiser le formulaire
export const defaultRapportData: RapportData = {
  site: 'Forage A',
  date: '24/04/2024',
  heure: '10:45',
  fichier: 'Report_24-04-2024.xlsx',
  problemes: '',
  donneesValides: true
};

// Options disponibles pour les sites de forage
export const sitesDeForage = [
  { value: 'Forage A', label: 'Forage A' },
  { value: 'Forage B', label: 'Forage B' },
  { value: 'Forage C', label: 'Forage C' },
];

// Fonction simulant l'importation du rapport (pour test)
export const importerRapport = (data: RapportData): Promise<boolean> => {
  return new Promise((resolve) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console -- Allow console.log for debugging in development mode
      console.log('Importation du rapport', data);
    }
    // Simule un délai de traitement de 1 seconde
    setTimeout(() => {
      resolve(true); // Simule une importation réussie
    }, 1000);
  });
};
