'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const phases = [
  { value: 'all', label: 'Toutes les phases' },
  { value: "26'", label: '26\'' },
  { value: "16\"", label: '16"' },
  { value: "12\"1/4", label: '12\"1/4' },
  { value: "8\"1/2", label: '8\"1/2' },
];

interface OperationsFiltersProps {
  onFiltersChange: (filters: {
    phase: string;
    drillingSite: string;
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  onSearchChange: (query: string) => void;
}

export function OperationsFilters({
  onFiltersChange,
  onSearchChange,
}: OperationsFiltersProps): React.JSX.Element {
  const [operationType, setOperationType] = React.useState('all');
  const [drillingSite, setDrillingSite] = React.useState('all');
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [availableSites, setAvailableSites] = React.useState<{ value: string; label: string }[]>([
    { value: 'all', label: 'Tous les sites' },
  ]);

  React.useEffect(() => {
    fetch('http://localhost:8099/api/puits')
      .then((res) => res.json())
      .then((data) => {
        const sites = data.map((puit: any) => ({
          value: puit.puitName ?? puit.name ?? 'Unknown',
          label: puit.puitName ?? puit.name ?? 'Unknown',
        }));
        setAvailableSites([{ value: 'all', label: 'Tous les sites' }, ...sites]);
      })
      .catch((err) => {
        console.error('Erreur lors du chargement des puits :', err);
      });
  }, []);

  const handleOperationTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPhase = event.target.value;
    setOperationType(newPhase);
    onFiltersChange({ phase: newPhase, drillingSite, startDate, endDate });
  };

  const handleDrillingSiteChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newSite = event.target.value;
    setDrillingSite(newSite);
    onFiltersChange({ phase: operationType, drillingSite: newSite, startDate, endDate });
  };

  const handleStartDateChange = (newValue: Date | null) => {
    setStartDate(newValue);
    onFiltersChange({ phase: operationType, drillingSite, startDate: newValue, endDate });
  };

  const handleEndDateChange = (newValue: Date | null) => {
    setEndDate(newValue);
    onFiltersChange({ phase: operationType, drillingSite, startDate, endDate: newValue });
  };

  const handleReset = (): void => {
    setOperationType('all');
    setDrillingSite('all');
    setStartDate(null);
    setEndDate(null);
    onFiltersChange({ phase: 'all', drillingSite: 'all', startDate: null, endDate: null });
    onSearchChange('');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <OutlinedInput
            defaultValue=""
            fullWidth
            placeholder="Rechercher des opérations"
            onChange={(e) => onSearchChange(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            }
          />
          <TextField
            label="Phase"
            name="phase"
            onChange={handleOperationTypeChange}
            select
            value={operationType}
            sx={{ minWidth: 200 }}
          >
            {phases.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Site de forage"
            name="drillingSite"
            onChange={handleDrillingSiteChange}
            select
            value={drillingSite}
            sx={{ minWidth: 200 }}
          >
            {availableSites.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <DatePicker
            label="Date de début"
            value={startDate}
            onChange={handleStartDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: { minWidth: 170 },
              },
            }}
          />

          <DatePicker
            label="Date de fin"
            value={endDate}
            onChange={handleEndDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: { minWidth: 170 },
              },
            }}
          />

          <Button
            color="inherit"
            onClick={handleReset}
            sx={{ alignSelf: { xs: 'center', md: 'auto' } }}
          >
            Réinitialiser
          </Button>
        </Stack>
      </Card>
    </LocalizationProvider>
  );
}
