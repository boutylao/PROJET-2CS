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

// Fonction pour normaliser les noms de phase
const normalizePhase = (phase: string): string =>
  phase.replace(/['"]+/g, '').trim().toLowerCase();

export default function AnalysePage(): React.JSX.Element {
  const [allRapports, setAllRapports] = useState<Analyse[]>([]);
  const [filteredRapports, setFilteredRapports] = useState<Analyse[]>([]);
  const [previsions, setPrevisions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    phase: 'all',
    drillingSite: 'all',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  // Récupération des prévisions
  useEffect(() => {
    fetch('http://localhost:8099/previsions/etat-par-phase')
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.reduce((acc: any, curr: any) => {
          const normalizedPhase = normalizePhase(curr.phaseName);
          acc[normalizedPhase] = curr;
          return acc;
        }, {});
        setPrevisions(mapped);
      })
      .catch((err) => console.error('Erreur chargement prévisions:', err));
  }, []);

  // Récupération des rapports
  useEffect(() => {
    fetch('http://localhost:8099/api/reports')
      .then((res) => res.json())
      .then((data) => {
        const mapped: Analyse[] = data.map((item: any) => {
          const phase = item.phase ?? 'N/A';
          const normalizedPhase = normalizePhase(phase);
          const prev = previsions[normalizedPhase] || {};

          return {
            id: `REP-${item.id}`,
            operationType: phase,
            drillingSite: item.puitName ?? 'Non spécifié',
            costPrevu: prev.coutPrevu?.toFixed(2) ?? '-',
            costReel: prev.coutReel?.toFixed(2) ?? '-',
            delaiPrevu: prev.delaiPrevu ?? '-',
            delaiReel: prev.delaiReel ?? '-',
            couleurCout: prev.couleurCout ?? undefined,
            couleurDelai: prev.couleurDelai ?? undefined,
            dailyCost: item.dailyCost?.dailyCost?.toFixed(2) ?? '-',
            date: new Date(item.date),
            status: item.analysis ? 'Complété' : 'En attente',
            reportUrl: `http://localhost:8099/api/reports/${item.id}/download`,
          };
        });

        setAllRapports(mapped);
      })
      .catch((err) => console.error('Erreur chargement des rapports:', err))
      .finally(() => setLoading(false));
  }, [previsions]);

  // Filtrage dynamique
  useEffect(() => {
    let result = [...allRapports];

    if (filters.phase !== 'all') {
      result = result.filter(r => normalizePhase(r.operationType) === normalizePhase(filters.phase));
    }

    if (filters.drillingSite !== 'all') {
      result = result.filter(r => r.drillingSite === filters.drillingSite);
    }

    if (filters.startDate) {
      result = result.filter(r => dayjs(r.date).isAfter(filters.startDate) || dayjs(r.date).isSame(filters.startDate, 'day'));
    }

    if (filters.endDate) {
      result = result.filter(r => dayjs(r.date).isBefore(filters.endDate) || dayjs(r.date).isSame(filters.endDate, 'day'));
    }

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.id.toLowerCase().includes(lowerQuery) ||
        r.operationType.toLowerCase().includes(lowerQuery) ||
        r.drillingSite.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredRapports(result);
  }, [allRapports, filters, searchQuery]);

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };
  
    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFiltersChange = (newFilters: {
    phase: string;
    drillingSite: string;
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const paginatedRapports = filteredRapports.slice(
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

      <AnalyseFilters
        onFiltersChange={handleFiltersChange}
        onSearchChange={handleSearchChange}
      />

      {loading ? (
        <CircularProgress sx={{ alignSelf: 'center', mt: 5 }} />
      ) : (
        <AnalyseTable
          count={filteredRapports.length}
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
