// src/app/dashboard/operations/page.tsx
import HistoriqueRapportsClient from './historique-rapports-client';

export const metadata = {
  title: 'Historique des Rapports | Dashboard',
};

export default function Page(): React.JSX.Element {
  return <HistoriqueRapportsClient />;
}
