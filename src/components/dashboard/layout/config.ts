import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';


export const navItems = [
  // { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  // { key: 'import', title: 'Import Rapports', href: paths.dashboard.customers, icon: 'users' },
  // { key: 'historique', title: 'Historique', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  { key: 'import', title: 'Import Rapports', href: paths.dashboard.settings, icon: 'import' },
  // { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
  { key: 'historique', title: 'Historique', href: paths.dashboard.historique, icon: 'history' },
  { key: 'rapport', title: 'Rapports', href: paths.dashboard.Rapports, icon: 'reports' },
  { key: 'analyse', title: 'Analyse', href: paths.dashboard.Analyse, icon: 'analysis' },
] satisfies NavItemConfig[];

export const navItemsOperator: NavItemConfig[] = [
  { key: 'import', title: 'Import Rapports', href: paths.dashboard.settings, icon: 'import' },
  { key: 'historique', title: 'Historique', href: paths.dashboard.historique, icon: 'history' },
];

export const navItemsExpert: NavItemConfig[] = [
  { key: 'rapport', title: 'Rapports', href: paths.dashboard.Rapports, icon: 'reports' },
  { key: 'analyse', title: 'Analyse', href: paths.dashboard.Analyse, icon: 'analysis' },
];
