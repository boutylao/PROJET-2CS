'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { FilePdf as FilePdfIcon } from '@phosphor-icons/react/dist/ssr/FilePdf';

const operationTypes = [
  { value: 'Exploration', label: 'Exploration' },
  { value: 'Extraction', label: 'Extraction' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Analyse', label: 'Analyse' },
  { value: 'Test', label: 'Test' },
  { value: 'Installation', label: 'Installation' },
];

const drillingSites = [
  { value: 'Site Alpha-7', label: 'Site Alpha-7' },
  { value: 'Site Beta-3', label: 'Site Beta-3' },
  { value: 'Site Gamma-5', label: 'Site Gamma-5' },
  { value: 'Site Delta-2', label: 'Site Delta-2' },
  { value: 'Site Epsilon-1', label: 'Site Epsilon-1' },
];


export function OperationForm(): React.JSX.Element {
  const [operationName, setOperationName] = React.useState('');
  const [operationType, setOperationType] = React.useState('');
  const [drillingSite, setDrillingSite] = React.useState('');
  const [date, setDate] = React.useState<Date | null>(new Date());
  const [time, setTime] = React.useState<Date | null>(new Date());
  const [reportFile, setReportFile] = React.useState<File | null>(null);

  const handleReportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setReportFile(event.target.files[0]);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Logique pour soumettre le formulaire
    // eslint-disable-next-line no-console -- Allow console.log for debugging in development mode
    console.log({
      operationName,
      operationType,
      drillingSite,
      date,
      time: time ? dayjs(time).format('HH:mm') : '',
      reportFile,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader title="Détails de l'opération" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom de l'opération"
                  name="operationName"
                  onChange={(e) => {setOperationName(e.target.value);}}
                  required
                  value={operationName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type d opération</InputLabel>
                  <Select
                    label="Type d'opération"
                    name="operationType"
                    onChange={(e) => {setOperationType(e.target.value);}}
                    value={operationType}
                  >
                    {operationTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Site de forage</InputLabel>
                  <Select
                    label="Site de forage"
                    name="drillingSite"
                    onChange={(e) => {setDrillingSite(e.target.value);}}
                    value={drillingSite}
                  >
                    {drillingSites.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date"
                  value={date}
                  onChange={(newValue) => {setDate(newValue);}}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Heure"
                  value={time}
                  onChange={(newValue) => {setTime(newValue);}}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Rapport d opération
                </Typography>
                <Box sx={{ mt: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}
                    >
                      Télécharger rapport
                      <input
                        type="file"
                        hidden
                        accept=".pdf"
                        onChange={handleReportFileChange}
                      />
                    </Button>
                    {reportFile ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FilePdfIcon fontSize="var(--icon-fontSize-md)" />
                        <Typography variant="body2">{reportFile.name}</Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Aucun fichier sélectionné
                      </Typography>
                    )}
                  </Stack>
                  <FormHelperText>Format accepté: PDF (max 10 MB)</FormHelperText>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button variant="contained" color="inherit">
              Annuler
            </Button>
            <Button type="submit" variant="contained">
              Enregistrer
            </Button>
          </CardActions>
        </Card>
      </form>
    </LocalizationProvider>
  );
}
