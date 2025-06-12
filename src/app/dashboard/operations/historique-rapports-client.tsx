// HistoriqueRapportsClient.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Stack, Typography, Button, CircularProgress,
} from '@mui/material';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { OperationsFilters } from '@/components/dashboard/operations/operations-filters';
import { OperationsTable, Operation } from '@/components/dashboard/operations/operations-table';

type Filters = {
  phase: string;
  drillingSite: string;
  startDate: Date | null;
  endDate: Date | null;
};

export default function HistoriqueRapportsClient(): React.JSX.Element {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [allOperations, setAllOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filters, setFilters] = useState<Filters>({
    phase: 'all',
    drillingSite: 'all',
    startDate: null,
    endDate: null,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('http://localhost:8099/api/reports')
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((item: any): Operation => ({
          id: `REP-${item.id}`,
          name: '',
          drillingSite: item.puitName || 'Non spécifié',
          operationType: item.phase || 'N/A',
          date: new Date(item.date),
          time: item.operations?.[0]?.startTime?.substring(0, 5) || '00:00',
          reportUrl: `http://localhost:8099/api/reports/${item.id}/download`,
          createdAt: new Date(item.date),
          excelFile: item.excelFile,

        }));
        setAllOperations(mapped);
      })
      .catch((err) => console.error('Erreur chargement rapports:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const filtered = allOperations.filter((op) => {
      const matchPhase = filters.phase === 'all' || op.operationType === filters.phase;
      const matchSite = filters.drillingSite === 'all' || op.drillingSite === filters.drillingSite;
      const matchStart = !filters.startDate || op.date >= new Date(filters.startDate);
      const matchEnd = !filters.endDate || op.date <= new Date(filters.endDate);
      const matchSearch =
        searchQuery === '' ||
        op.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.operationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.drillingSite.toLowerCase().includes(searchQuery.toLowerCase());

      return matchPhase && matchSite && matchStart && matchEnd && matchSearch;
    });

    setOperations(filtered);
    setPage(0); // reset to first page when filters change
  }, [filters, allOperations, searchQuery]);

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedOperations = operations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

      <OperationsFilters
        onFiltersChange={setFilters}
        onSearchChange={setSearchQuery}
      />

      {loading ? (
        <CircularProgress sx={{ alignSelf: 'center', mt: 5 }} />
      ) : (
        <OperationsTable
          count={operations.length}
          page={page}
          rows={paginatedOperations}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </Stack>
  );
}
