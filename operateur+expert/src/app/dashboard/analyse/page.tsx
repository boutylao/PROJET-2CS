'use client';

import React, { useEffect, useState } from 'react';
import {
  Stack, Typography, Button, CircularProgress,
} from '@mui/material';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';

import { config } from '@/config';
import { AnalyseFilters } from '@/components/dashboard/analyse/analyse-filters';
import { AnalyseTable, Analyse } from '@/components/dashboard/analyse/analyse-table';

export default function AnalysePage(): React.JSX.Element {
  const [rapports, setRapports] = useState<Analyse[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8099/api/reports')
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((item: any): Analyse => ({
          id: `REP-${item.id}`,
          operationType: item.phase || 'N/A',
          drillingSite: item.puitId ? `Puit ${item.puitId}` : 'Non spécifié',
          costPrevu: '-', // temporairement vide
          costReel: item.dailyCost?.dailyCost?.toFixed(2) ?? '-',
          delaiPrevu: '-', // temporairement vide
          delaiReel: item.drillingHours?.toFixed(1) + 'h' ?? '-',
          date: new Date(item.date),
          status: item.analysis ? 'Complété' : 'En cours',
          reportUrl: `http://localhost:8099/api/reports/${item.id}/download`,
        }));
        setRapports(mapped);
      })
      .catch((err) => console.error('Erreur chargement des rapports:', err))
      .finally(() => setLoading(false));
  }, []);
  
  const handlePageChange = (_event: unknown, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRapports = rapports.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

      {loading ? (
        <CircularProgress sx={{ alignSelf: 'center', mt: 5 }} />
      ) : (
        <AnalyseTable
          count={rapports.length}
          page={page}
          rows={paginatedRapports}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </Stack>
  );
}
