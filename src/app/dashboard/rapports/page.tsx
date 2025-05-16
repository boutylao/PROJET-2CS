import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';

import { config } from '@/config';
import { RapportsFilters } from '@/components/dashboard/rapports/rapports-traites-filters';
import { RapportsTable } from '@/components/dashboard/rapports/rapports-traites-table';
import type { Rapport } from '@/components/dashboard/rapports/rapports-traites-table';

export const metadata = { title: `Rapports A Traiter | Dashboard | ${config.site.name}` } satisfies Metadata;

const rapports = [
  {
    id: 'OP-2025-010',
    name: 'Forage exploratoire',
    drillingSite: 'Site Alpha-7',
    operationType: 'Exploration',
    date: dayjs().subtract(2, 'days').toDate(),
    time: '08:30',
    reportUrl: '/reports/OP-2025-010.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(2, 'days').toDate(),
  },
  {
    id: 'OP-2025-009',
    name: 'Extraction test',
    drillingSite: 'Site Beta-3',
    operationType: 'Extraction',
    date: dayjs().subtract(3, 'days').toDate(),
    time: '10:15',
    reportUrl: '/reports/OP-2025-009.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(3, 'days').toDate(),
  },
  {
    id: 'OP-2025-008',
    name: 'Maintenance préventive',
    drillingSite: 'Site Gamma-5',
    operationType: 'Maintenance',
    date: dayjs().subtract(5, 'days').toDate(),
    time: '14:45',
    reportUrl: '/reports/OP-2025-008.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(5, 'days').toDate(),
  },
  {
    id: 'OP-2025-007',
    name: 'Forage profond',
    drillingSite: 'Site Alpha-7',
    operationType: 'Extraction',
    date: dayjs().subtract(7, 'days').toDate(),
    time: '07:00',
    reportUrl: '/reports/OP-2025-007.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(7, 'days').toDate(),
  },
  {
    id: 'OP-2025-006',
    name: 'Analyse de sol',
    drillingSite: 'Site Delta-2',
    operationType: 'Analyse',
    date: dayjs().subtract(10, 'days').toDate(),
    time: '09:30',
    reportUrl: '/reports/OP-2025-006.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(10, 'days').toDate(),
  },
  {
    id: 'OP-2025-005',
    name: 'Extraction continue',
    drillingSite: 'Site Epsilon-1',
    operationType: 'Extraction',
    date: dayjs().subtract(12, 'days').toDate(),
    time: '11:20',
    reportUrl: '/reports/OP-2025-005.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(12, 'days').toDate(),
  },
  {
    id: 'OP-2025-004',
    name: 'Test de pression',
    drillingSite: 'Site Beta-3',
    operationType: 'Test',
    date: dayjs().subtract(15, 'days').toDate(),
    time: '16:45',
    reportUrl: '/reports/OP-2025-004.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(15, 'days').toDate(),
  },
  {
    id: 'OP-2025-003',
    name: 'Maintenance d\'urgence',
    drillingSite: 'Site Gamma-5',
    operationType: 'Maintenance',
    date: dayjs().subtract(18, 'days').toDate(),
    time: '13:10',
    reportUrl: '/reports/OP-2025-003.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(18, 'days').toDate(),
  },
  {
    id: 'OP-2025-002',
    name: 'Forage initial',
    drillingSite: 'Site Delta-2',
    operationType: 'Exploration',
    date: dayjs().subtract(21, 'days').toDate(),
    time: '08:00',
    reportUrl: '/reports/OP-2025-002.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(21, 'days').toDate(),
  },
  {
    id: 'OP-2025-001',
    name: 'Installation équipement',
    drillingSite: 'Site Alpha-7',
    operationType: 'Installation',
    date: dayjs().subtract(25, 'days').toDate(),
    time: '09:45',
    reportUrl: '/reports/OP-2025-001.pdf',
    status: 'Complété',
    createdAt: dayjs().subtract(25, 'days').toDate(),
  },
] satisfies Rapport[];

export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;

  const paginatedOperations = applyPagination(rapports, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Rapports A Traiter</Typography>
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
      <RapportsFilters />
      <RapportsTable
        count={rapports.length}
        page={page}
        rows={paginatedOperations}
        rowsPerPage={rowsPerPage}
      />
    </Stack>
  );
}

function applyPagination(rows: Rapport[], page: number, rowsPerPage: number): Rapport[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
