import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';

import { config } from '@/config';
import { AnalyseFilters } from '@/components/dashboard/analyse/analyse-filters';
import { AnalyseTable } from '@/components/dashboard/analyse/analyse-table';
import type { Analyse } from '@/components/dashboard/analyse/analyse-table';

export const metadata = { title: `Analyse des Rapports | Dashboard | ${config.site.name}` } satisfies Metadata;

// Données de test
const rapports = [
  {
    id: 'OP-2025-010',
    name: 'Forage exploratoire',
    drillingSite: 'Site Alpha-7',
    operationType: 'Exploration',
    cost: '28,500 €',
    delay: '2 semaines',
    date: dayjs().subtract(2, 'days').toDate(),
    time: '08:30',
    problem: 'Résistance du sol plus élevée que prévu',
    reportUrl: '/reports/OP-2025-010.pdf',
    status: 'Annulé',
    createdAt: dayjs().subtract(2, 'days').toDate(),
  },
  {
    id: 'OP-2025-009',
    name: 'Extraction test',
    drillingSite: 'Site Beta-3',
    operationType: 'Extraction',
    cost: '32,700 €',
    delay: '3 semaines',
    date: dayjs().subtract(2, 'days').toDate(),
    time: '08:30',
    problem: 'Aucun problème majeur rencontré',
    reportUrl: '/reports/OP-2025-009.pdf',
    status: 'En cours',
    createdAt: dayjs().subtract(3, 'days').toDate(),
  },
  {
    id: 'OP-2025-008',
    name: 'Maintenance préventive',
    drillingSite: 'Site Gamma-5',
    operationType: 'Maintenance',
    cost: '12,300 €',
    delay: '5 jours',
    date: dayjs().subtract(2, 'days').toDate(),
    time: '08:30',
    problem: 'Pièces de rechange manquantes',
    reportUrl: '/reports/OP-2025-008.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(5, 'days').toDate(),
  },
  {
    id: 'OP-2025-007',
    name: 'Forage profond',
    drillingSite: 'Site Alpha-7',
    operationType: 'Extraction',
    cost: '45,600 €',
    delay: '4 semaines',
    date: dayjs().subtract(2, 'days').toDate(),
    time: '08:30',
    problem: 'Difficultés techniques liées à la profondeur',
    reportUrl: '/reports/OP-2025-007.pdf',
    status: 'Planifié',
    createdAt: dayjs().subtract(7, 'days').toDate(),
  },
  {
    id: 'OP-2025-006',
    name: 'Analyse de sol',
    drillingSite: 'Site Delta-2',
    operationType: 'Analyse',
    cost: '8,900 €',
    delay: '1 semaine',
    date: dayjs().subtract(2, 'days').toDate(),
    time: '08:30',
    problem: 'Aucun',
    reportUrl: '/reports/OP-2025-006.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(10, 'days').toDate(),
  },
  {
    id: 'OP-2025-005',
    name: 'Extraction continue',
    drillingSite: 'Site Epsilon-1',
    operationType: 'Extraction',
    cost: '37,800 €',
    delay: '6 semaines',
    date: dayjs().subtract(2, 'days').toDate(),
    time: '08:30',
    problem: 'Pannes répétées des équipements',
    reportUrl: '/reports/OP-2025-005.pdf',
    status: 'Annulé',
    createdAt: dayjs().subtract(12, 'days').toDate(),
  },
  {
    id: 'OP-2025-004',
    name: 'Test de pression',
    drillingSite: 'Site Beta-3',
    operationType: 'Test',
    cost: '7,500 €',
    delay: '3 jours',
    date: dayjs().subtract(2, 'days').toDate(),
    time: '08:30',
    problem: 'Conditions météorologiques défavorables',
    reportUrl: '/reports/OP-2025-004.pdf',
    status: 'Planifié',
    createdAt: dayjs().subtract(15, 'days').toDate(),
  },
  {
    id: 'OP-2025-003',
    name: 'Maintenance d\'urgence',
    drillingSite: 'Site Gamma-5',
    operationType: 'Maintenance',
    cost: '18,400 €',
    delay: '1 semaine',
    date: dayjs().subtract(2, 'days').toDate(),
    time: '08:30',
    problem: 'Défaillance critique du système principal',
    reportUrl: '/reports/OP-2025-003.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(18, 'days').toDate(),
  },
  {
    id: 'OP-2025-002',
    name: 'Forage initial',
    drillingSite: 'Site Delta-2',
    operationType: 'Exploration',
    cost: '25,700 €',
    delay: '2 semaines',
    date: dayjs().subtract(2, 'days').toDate(),
    time: '08:30',
    problem: 'Terrain difficile, progression lente',
    reportUrl: '/reports/OP-2025-002.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(21, 'days').toDate(),
  },
  {
    id: 'OP-2025-001',
    name: 'Installation équipement',
    drillingSite: 'Site Alpha-7',
    operationType: 'Installation',
    cost: '52,300 €',
    delay: '3 semaines',
    date: dayjs().subtract(2, 'days').toDate(),
    time: '08:30',
    problem: 'Retards dus à des problèmes logistiques',
    reportUrl: '/reports/OP-2025-001.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(25, 'days').toDate(),
  },
] satisfies Analyse[];

export default function AnalysePage(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;

  const paginatedRapports = applyPagination(rapports, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Analyse des Rapports</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
              Importer
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
              Exporter
            </Button>
          </Stack>
        </Stack>
      </Stack>
      <AnalyseFilters />
      <AnalyseTable
        count={rapports.length}
        page={page}
        rows={paginatedRapports}
        rowsPerPage={rowsPerPage}
      />
    </Stack>
  );
}

function applyPagination(rows: Analyse[], page: number, rowsPerPage: number): Analyse[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
