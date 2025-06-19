import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'import', title: 'Import Rapports', href: paths.dashboard.settings, icon: 'import' },
  { key: 'historique', title: 'Historique', href: paths.dashboard.historique, icon: 'history' },
  { key: 'analyse', title: 'Analyse', href: paths.dashboard.Analyse, icon: 'analysis' },
  { key: 'puit', title: 'Puits', href: paths.dashboard.Rapports, icon: 'drop' }, // ✅ Icône mise à jour
] satisfies NavItemConfig[];

export const navItemsOperator: NavItemConfig[] = [
  { key: 'import', title: 'Import Rapports', href: paths.dashboard.settings, icon: 'import' },
  { key: 'historique', title: 'Historique', href: paths.dashboard.historique, icon: 'history' },
];

export const navItemsExpert: NavItemConfig[] = [
  { key: 'analyse', title: 'Analyse', href: paths.dashboard.Analyse, icon: 'analysis' },
  { key: 'puit', title: 'Puits', href: paths.dashboard.Rapports, icon: 'drop' }, // ✅ Icône mise à jour
];
