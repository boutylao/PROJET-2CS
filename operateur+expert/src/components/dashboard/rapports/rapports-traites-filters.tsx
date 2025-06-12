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

const operationTypes = [
  { value: 'all', label: 'Tous les types' },
  { value: 'Exploration', label: 'Exploration' },
  { value: 'Extraction', label: 'Extraction' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Analyse', label: 'Analyse' },
  { value: 'Test', label: 'Test' },
  { value: 'Installation', label: 'Installation' },
];

const drillingSites = [
  { value: 'all', label: 'Tous les sites' },
  { value: 'Site Alpha-7', label: 'Site Alpha-7' },
  { value: 'Site Beta-3', label: 'Site Beta-3' },
  { value: 'Site Gamma-5', label: 'Site Gamma-5' },
  { value: 'Site Delta-2', label: 'Site Delta-2' },
  { value: 'Site Epsilon-1', label: 'Site Epsilon-1' },
];

export function RapportsFilters(): React.JSX.Element {
  const [operationType, setOperationType] = React.useState('all');
  const [drillingSite, setDrillingSite] = React.useState('all');
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  const handleOperationTypeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setOperationType(event.target.value);
  };

  const handleDrillingSiteChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDrillingSite(event.target.value);
  };

  const handleReset = (): void => {
    setOperationType('all');
    setDrillingSite('all');
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={{ p: 2 }}>
        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          spacing={3}
        >
          <OutlinedInput
            defaultValue=""
            fullWidth
            placeholder="Rechercher des opérations"
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            }
          />
          <TextField
            label="Type d'opération"
            name="operationType"
            onChange={handleOperationTypeChange}
            select
            SelectProps={{ native: false }}
            value={operationType}
            sx={{ minWidth: 200 }}
          >
            {operationTypes.map((option) => (
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
            SelectProps={{ native: false }}
            value={drillingSite}
            sx={{ minWidth: 200 }}
          >
            {drillingSites.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <DatePicker
            label="Date de début"
            value={startDate}
            onChange={(newValue) => {setStartDate(newValue);}}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: { minWidth: 170 }
              }
            }}
          />
          <DatePicker
            label="Date de fin"
            value={endDate}
            onChange={(newValue) => {setEndDate(newValue);}}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: { minWidth: 170 }
              }
            }}
          />
          <Button
            color="inherit"
            onClick={handleReset}
            sx={{
              alignSelf: {
                xs: 'center',
                md: 'auto'
              }
            }}
          >
            Réinitialiser
          </Button>
        </Stack>
      </Card>
    </LocalizationProvider>
  );
}
