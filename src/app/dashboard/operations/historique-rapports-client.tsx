'use client';

import React, { useEffect, useState } from 'react';
import {
  Stack, Typography, Button, CircularProgress,
} from '@mui/material';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { OperationsFilters } from '@/components/dashboard/operations/operations-filters';
import { OperationsTable } from '@/components/dashboard/operations/operations-table';
import type { Operation } from '@/components/dashboard/operations/operations-table';

export default function HistoriqueRapportsClient(): React.JSX.Element {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const page = 0;
  const rowsPerPage = 5;

  useEffect(() => {
    fetch('http://localhost:8099/api/reports')
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((item: any): Operation => ({
          id: `OP-${item.id}`,
          name: item.operations?.[0]?.description || '—',
          drillingSite: item.puitName || 'Non spécifié',
          operationType: item.phase || 'N/A',
          date: new Date(item.date),
          time: item.operations?.[0]?.startTime?.substring(0, 5) || '00:00',
          reportUrl: `http://localhost:8099/api/reports/${item.id}/download`,
          createdAt: new Date(item.date),
        }));
        setOperations(mapped);
      })
      .catch((err) => console.error('Erreur chargement rapports:', err))
      .finally(() => setLoading(false));
  }, []);

  const paginatedOperations = applyPagination(operations, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Historique des Rapports</Typography>
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

      {loading ? (
        <CircularProgress sx={{ alignSelf: 'center', mt: 5 }} />
      ) : (
        <>
          <OperationsFilters />
          <OperationsTable
            count={operations.length}
            page={page}
            rows={paginatedOperations}
            rowsPerPage={rowsPerPage}
          />
        </>
      )}
    </Stack>
  );
}

function applyPagination(rows: Operation[], page: number, rowsPerPage: number): Operation[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
