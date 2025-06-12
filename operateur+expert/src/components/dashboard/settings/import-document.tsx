'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Typography from '@mui/material/Typography';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

// Import des données provisoires
import { defaultRapportData, sitesDeForage, importerRapport, RapportData } from './mockdata';

// Style pour le composant d'upload
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export function ImportationRapport(): React.JSX.Element {
  // Utilisation d'un seul état pour toutes les données du rapport
  const [rapportData, setRapportData] = React.useState<RapportData>(defaultRapportData);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  // Fonction pour mettre à jour une propriété spécifique du rapport
  const updateRapportData = (field: keyof RapportData, value: string | number | boolean | Date | null) => {
    setRapportData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      updateRapportData('fichier', file.name);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Utilisation de la fonction d'importation simulée
      const success = await importerRapport(rapportData);
      if (success) {
        // eslint-disable-next-line no-console -- Allow console.log for debugging in development mode
        console.log('Importation réussie !');
      }
    } catch (error) {
      // eslint-disable-next-line no-console -- Allow console.log for debugging in development mode
      console.error('Erreur lors de l\'importation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader
            title="Importation de Rapport"
            subheader="Saisir les informations du rapport de forage"
          />
          <Divider />
          <CardContent>
            <Stack spacing={3} sx={{ width: '100%' }}>
              {/* Site de forage - pleine largeur */}
              <FormControl fullWidth>
                <InputLabel>Site de forage</InputLabel>
                <Select
                  value={rapportData.site}
                  onChange={(e) => { updateRapportData('site', e.target.value); }}
                  input={<OutlinedInput label="Site de forage" />}
                >
                  {sitesDeForage.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Date et heure sur la même ligne */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl sx={{ flex: 1 }}>
                  <DatePicker
                    label="Date"
                    value={rapportData.date ? new Date(rapportData.date) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        updateRapportData('date', newValue.toISOString().split('T')[0]);
                      }
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <TimePicker
                    label="Heure"
                    value={rapportData.heure ? new Date(`2023-01-01T${rapportData.heure}`) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        const timeString = newValue.toTimeString().split(' ')[0].substring(0, 5);
                        updateRapportData('heure', timeString);
                      }
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </FormControl>
              </Stack>

              {/* Fichier - pièce jointe */}
              <FormControl fullWidth>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
                  <InputLabel htmlFor="upload-file" sx={{ position: 'static', transform: 'none' }}>Pièce jointe</InputLabel>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start', height: '56px' }}
                  >
                    {selectedFile ? selectedFile.name : 'Choisir un fichier'}
                    <VisuallyHiddenInput
                      type="file"
                      id="upload-file"
                      onChange={handleFileChange}
                    />
                  </Button>
                </Box>
              </FormControl>

              {/* Problèmes rencontrés - pleine largeur */}
              <FormControl fullWidth>
                <InputLabel>Problèmes rencontrés</InputLabel>
                <OutlinedInput
                  label="Problèmes rencontrés"
                  multiline
                  rows={4}
                  value={rapportData.problemes}
                  onChange={(e) => {updateRapportData('problemes', e.target.value);}}
                />
              </FormControl>

              {/* Indicateur de données valides */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="body2">Données valides</Typography>
              </Box>
            </Stack>
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? 'Importation...' : 'Importer le rapport'}
            </Button>
          </CardActions>
        </Card>
      </form>
    </LocalizationProvider>
  );
}
