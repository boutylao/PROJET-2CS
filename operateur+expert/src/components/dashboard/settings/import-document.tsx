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
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CommentIcon from '@mui/icons-material/Comment';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

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

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.06)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px !important',
  boxShadow: 'none',
  '&:before': {
    display: 'none',
  },
  '&:not(:last-child)': {
    marginBottom: theme.spacing(2),
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: 'rgba(25, 118, 210, 0.04)',
  borderRadius: '12px 12px 0 0',
  minHeight: 56,
  '&.Mui-expanded': {
    minHeight: 56,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
  borderRadius: 28,
  color: 'white',
  fontWeight: 600,
  textTransform: 'none',
  padding: '10px 24px',
  boxShadow: '0 3px 12px rgba(25, 118, 210, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
  },
  '&:disabled': {
    background: 'rgba(0, 0, 0, 0.12)',
    boxShadow: 'none',
  },
}));

const IconWithBackground = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    color: theme.palette.primary.main,
  },
}));

export function ImportationRapport(): React.JSX.Element {
  const [rapportData, setRapportData] = React.useState<any>({});
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [puits, setPuits] = React.useState<any[]>([]);
  const [isExtracting, setIsExtracting] = React.useState<boolean>(false);
  const [showModificationForm, setShowModificationForm] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetch('http://localhost:8099/api/puits')
      .then((res) => res.json())
      .then((data) => setPuits(data))
      .catch((err) => console.error('Erreur chargement puits:', err));
  }, []);

  const updateRapportData = (field: string, value: any) => {
    setRapportData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateNestedData = (section: string, field: string, value: any) => {
    setRapportData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateOperationData = (index: number, field: string, value: any) => {
    setRapportData((prev: any) => ({
      ...prev,
      operations: prev.operations?.map((op: any, i: number) => 
        i === index ? { ...op, [field]: value } : op
      ) || []
    }));
  };

  const addOperation = () => {
    setRapportData((prev: any) => ({
      ...prev,
      operations: [
        ...(prev.operations || []),
        {
          code: '',
          rate: 'T1',
          startTime: '00:00',
          endTime: '00:00',
          initialDepth: 0,
          finalDepth: 0,
          description: ''
        }
      ]
    }));
  };

  const removeOperation = (index: number) => {
    setRapportData((prev: any) => ({
      ...prev,
      operations: prev.operations?.filter((_: any, i: number) => i !== index) || []
    }));
  };

  const updateRemark = (index: number, value: string) => {
    setRapportData((prev: any) => ({
      ...prev,
      remarks: prev.remarks?.map((remark: string, i: number) => 
        i === index ? value : remark
      ) || []
    }));
  };

  const addRemark = () => {
    setRapportData((prev: any) => ({
      ...prev,
      remarks: [...(prev.remarks || []), '']
    }));
  };

  const removeRemark = (index: number) => {
    setRapportData((prev: any) => ({
      ...prev,
      remarks: prev.remarks?.filter((_: string, i: number) => i !== index) || []
    }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0 && rapportData.site) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setIsExtracting(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('puitId', rapportData.site);

      try {
        const response = await fetch('http://localhost:8099/api/reports/extract', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setRapportData((prev: any) => ({ ...prev, ...data }));
          setShowModificationForm(true);
        } else {
          console.error('Erreur extraction:', await response.text());
        }
      } catch (error) {
        console.error('Erreur lors de l\'appel à extract:', error);
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8099/api/reports/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rapportData),
      });

      if (response.ok) {
        alert('Rapport importé avec succès');
        setShowModificationForm(false);
        setRapportData({});
        setSelectedFile(null);
      } else {
        alert('Erreur serveur lors de l\'importation');
      }
    } catch (error) {
      console.error('Erreur d\'envoi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour déterminer si un champ est vide et doit être marqué en rouge
  const isFieldEmpty = (value: any) => {
    return value === '' || value === null || value === undefined || value === 0;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 3 }}>
        <Stack spacing={3} sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
          {/* Formulaire d'upload initial */}
          <StyledCard>
            <CardHeader
              avatar={
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'primary.main',
                  color: 'white'
                }}>
                  <UploadFileIcon />
                </Box>
              }
              title={
                <Typography variant="h5" fontWeight={600} color="text.primary">
                  Importation de Rapport
                </Typography>
              }
              subheader={
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Sélectionnez un site de forage et importez votre rapport
                </Typography>
              }
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Site de forage</InputLabel>
                  <Select
                    value={rapportData.site || ''}
                    onChange={(e) => updateRapportData('site', e.target.value)}
                    input={<OutlinedInput label="Site de forage" />}
                    sx={{ borderRadius: 2 }}
                  >
                    {puits.map((option) => (
                      <MenuItem key={option.puitId} value={option.puitId}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            bgcolor: 'primary.main' 
                          }} />
                          {option.puitName}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel sx={{ position: 'static', transform: 'none', mb: 1 }}>
                    Fichier de rapport
                  </InputLabel>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ 
                      justifyContent: 'flex-start', 
                      height: 56,
                      borderRadius: 2,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      '&:hover': {
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        bgcolor: 'rgba(25, 118, 210, 0.04)',
                      }
                    }}
                  >
                    {selectedFile ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={selectedFile.name} 
                          color="primary" 
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    ) : (
                      'Glissez un fichier ici ou cliquez pour sélectionner'
                    )}
                    <VisuallyHiddenInput
                      type="file"
                      onChange={handleFileChange}
                    />
                  </Button>
                </FormControl>

                {isExtracting && (
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: 'rgba(25, 118, 210, 0.04)', 
                    borderRadius: 2,
                    border: '1px solid rgba(25, 118, 210, 0.12)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body1" fontWeight={500}>
                        Extraction des données en cours...
                      </Typography>
                    </Box>
                    <LinearProgress sx={{ borderRadius: 1 }} />
                  </Box>
                )}
              </Stack>
            </CardContent>
          </StyledCard>

          {/* Formulaire de modification des données extraites */}
          {showModificationForm && rapportData.operations && (
            <form onSubmit={handleSubmit}>
              <StyledCard>
                <CardHeader
                  avatar={
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      bgcolor: 'success.main',
                      color: 'white'
                    }}>
                      <EditIcon />
                    </Box>
                  }
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h5" fontWeight={600}>
                        Rapport de Forage - Jour {rapportData.report?.day || 'N/A'}
                      </Typography>
                      <Chip 
                        label="Données extraites" 
                        color="success" 
                        size="small"
                        icon={<CheckCircleIcon />}
                      />
                    </Box>
                  }
                  subheader={
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Puits: {rapportData.puitName || 'N/A'} | ID: {rapportData.puitId || 'N/A'}
                    </Typography>
                  }
                  sx={{ pb: 2 }}
                />
                <Divider />
                <CardContent sx={{ pt: 3 }}>
                  <Stack spacing={2}>
                    {/* Informations générales */}
                    <StyledAccordion defaultExpanded>
                      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <IconWithBackground>
                          <AssignmentIcon />
                          <Typography variant="h6" fontWeight={600}>
                            Informations Générales
                          </Typography>
                        </IconWithBackground>
                      </StyledAccordionSummary>
                      <AccordionDetails sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Nom du Puits"
                              value={rapportData.puitName || ''}
                              onChange={(e) => updateRapportData('puitName', e.target.value)}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.puitName) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.puitName)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="ID Puits"
                              value={rapportData.puitId || ''}
                              onChange={(e) => updateRapportData('puitId', e.target.value)}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.puitId) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.puitId)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Jour"
                              type="number"
                              value={rapportData.report?.day || ''}
                              onChange={(e) => updateNestedData('report', 'day', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.report?.day) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.report?.day)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Phase"
                              value={rapportData.report?.phase || ''}
                              onChange={(e) => updateNestedData('report', 'phase', e.target.value)}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.report?.phase) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.report?.phase)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Profondeur (ft)"
                              type="number"
                              value={rapportData.report?.depth || ''}
                              onChange={(e) => updateNestedData('report', 'depth', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.report?.depth) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.report?.depth)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="TVD (ft)"
                              type="number"
                              value={rapportData.report?.tvd || ''}
                              onChange={(e) => updateNestedData('report', 'tvd', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.report?.tvd) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.report?.tvd)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Heures de Forage"
                              type="number"
                              value={rapportData.report?.drillingHours || ''}
                              onChange={(e) => updateNestedData('report', 'drillingHours', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.report?.drillingHours) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.report?.drillingHours)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Progrès de Forage (ft)"
                              type="number"
                              value={rapportData.report?.drillingProgress || ''}
                              onChange={(e) => updateNestedData('report', 'drillingProgress', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.report?.drillingProgress) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.report?.drillingProgress)}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Opération Planifiée"
                              multiline
                              rows={3}
                              value={rapportData.report?.plannedOperation || ''}
                              onChange={(e) => updateNestedData('report', 'plannedOperation', e.target.value)}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.report?.plannedOperation) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.report?.plannedOperation)}
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </StyledAccordion>

                    {/* Opérations */}
                    <StyledAccordion>
                      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <IconWithBackground>
                          <AssignmentIcon />
                          <Typography variant="h6" fontWeight={600}>
                            Opérations
                          </Typography>
                        </IconWithBackground>
                      </StyledAccordionSummary>
                      <AccordionDetails sx={{ p: 3 }}>
                        <Box sx={{ mb: 3 }}>
                          <Button
                            startIcon={<AddIcon />}
                            onClick={addOperation}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                          >
                            Ajouter Opération
                          </Button>
                        </Box>
                        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Taux</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>H. Début</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>H. Fin</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Prof. Init.</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Prof. Fin.</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rapportData.operations?.map((operation: any, index: number) => (
                                <TableRow key={index} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      value={operation.code || ''}
                                      onChange={(e) => updateOperationData(index, 'code', e.target.value)}
                                      sx={{ width: 80 }}
                                      error={isFieldEmpty(operation.code)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      value={operation.rate || ''}
                                      onChange={(e) => updateOperationData(index, 'rate', e.target.value)}
                                      sx={{ width: 60 }}
                                      error={isFieldEmpty(operation.rate)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      type="time"
                                      value={operation.startTime || ''}
                                      onChange={(e) => updateOperationData(index, 'startTime', e.target.value)}
                                      sx={{ width: 100 }}
                                      error={isFieldEmpty(operation.startTime)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      type="time"
                                      value={operation.endTime || ''}
                                      onChange={(e) => updateOperationData(index, 'endTime', e.target.value)}
                                      sx={{ width: 100 }}
                                      error={isFieldEmpty(operation.endTime)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={operation.initialDepth || ''}
                                      onChange={(e) => updateOperationData(index, 'initialDepth', parseFloat(e.target.value))}
                                      sx={{ width: 80 }}
                                      error={isFieldEmpty(operation.initialDepth)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={operation.finalDepth || ''}
                                      onChange={(e) => updateOperationData(index, 'finalDepth', parseFloat(e.target.value))}
                                      sx={{ width: 80 }}
                                      error={isFieldEmpty(operation.finalDepth)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TextField
                                      size="small"
                                      multiline
                                      value={operation.description || ''}
                                      onChange={(e) => updateOperationData(index, 'description', e.target.value)}
                                      sx={{ minWidth: 200 }}
                                      error={isFieldEmpty(operation.description)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <IconButton
                                      size="small"
                                      onClick={() => removeOperation(index)}
                                      color="error"
                                      sx={{ borderRadius: 2 }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </StyledAccordion>

                    {/* Coûts */}
                    <StyledAccordion>
                      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <IconWithBackground>
                          <MonetizationOnIcon />
                          <Typography variant="h6" fontWeight={600}>
                            Coûts Journaliers
                          </Typography>
                        </IconWithBackground>
                      </StyledAccordionSummary>
                      <AccordionDetails sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Appareil de Forage ($)"
                              type="number"
                              value={rapportData.dailyCost?.drillingRig || ''}
                              onChange={(e) => updateNestedData('dailyCost', 'drillingRig', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.dailyCost?.drillingRig) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.dailyCost?.drillingRig)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Approvisionnement Eau ($)"
                              type="number"
                              value={rapportData.dailyCost?.waterSupply || ''}
                              onChange={(e) => updateNestedData('dailyCost', 'waterSupply', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.dailyCost?.waterSupply) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.dailyCost?.waterSupply)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Mud Logging ($)"
                              type="number"
                              value={rapportData.dailyCost?.mudLogging || ''}
                              onChange={(e) => updateNestedData('dailyCost', 'mudLogging', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.dailyCost?.mudLogging) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.dailyCost?.mudLogging)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Services Eau ($)"
                              type="number"
                              value={rapportData.dailyCost?.waterServices || ''}
                              onChange={(e) => updateNestedData('dailyCost', 'waterServices', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.dailyCost?.waterServices) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.dailyCost?.waterServices)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Boue de Forage ($)"
                              type="number"
                              value={rapportData.dailyCost?.drillingMud || ''}
                              onChange={(e) => updateNestedData('dailyCost', 'drillingMud', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.dailyCost?.drillingMud) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.dailyCost?.drillingMud)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Sécurité ($)"
                              type="number"
                              value={rapportData.dailyCost?.security || ''}
                              onChange={(e) => updateNestedData('dailyCost', 'security', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.dailyCost?.security) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.dailyCost?.security)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Contrôle Solides ($)"
                              type="number"
                              value={rapportData.dailyCost?.solidControl || ''}
                              onChange={(e) => updateNestedData('dailyCost', 'solidControl', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.dailyCost?.solidControl) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.dailyCost?.solidControl)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Outils ($)"
                              type="number"
                              value={rapportData.dailyCost?.bits || ''}
                              onChange={(e) => updateNestedData('dailyCost', 'bits', parseFloat(e.target.value))}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.dailyCost?.bits) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.dailyCost?.bits)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              label="Coût Total Journalier ($)"
                              type="number"
                              value={rapportData.dailyCost?.dailyCost || ''}
                              onChange={(e) => updateNestedData('dailyCost', 'dailyCost', parseFloat(e.target.value))}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                  fontWeight: 600,
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                                  },
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: isFieldEmpty(rapportData.dailyCost?.dailyCost) ? 'error.main' : undefined
                                }
                              }}
                              error={isFieldEmpty(rapportData.dailyCost?.dailyCost)}
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </StyledAccordion>

                    {/* Remarques */}
                    <StyledAccordion>
                      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <IconWithBackground>
                          <CommentIcon />
                          <Typography variant="h6" fontWeight={600}>
                            Remarques
                          </Typography>
                        </IconWithBackground>
                      </StyledAccordionSummary>
                      <AccordionDetails sx={{ p: 3 }}>
                        <Box sx={{ mb: 3 }}>
                          <Button
                            startIcon={<AddIcon />}
                            onClick={addRemark}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                          >
                            Ajouter Remarque
                          </Button>
                        </Box>
                        <Stack spacing={2}>
                          {rapportData.remarks?.map((remark: string, index: number) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                value={remark}
                                onChange={(e) => updateRemark(index, e.target.value)}
                                placeholder="Remarque..."
                                sx={{ 
                                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: isFieldEmpty(remark) ? 'error.main' : undefined
                                  }
                                }}
                                error={isFieldEmpty(remark)}
                              />
                              <IconButton
                                size="small"
                                onClick={() => removeRemark(index)}
                                color="error"
                                sx={{ borderRadius: 2 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </StyledAccordion>

                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mt: 3,
                      p: 2,
                      bgcolor: 'rgba(76, 175, 80, 0.08)',
                      borderRadius: 2,
                      border: '1px solid rgba(76, 175, 80, 0.2)'
                    }}>
                      <CheckCircleIcon color="success" />
                      <Typography variant="body2" color="success.main" fontWeight={500}>
                        Données extraites et modifiables
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end', p: 3, gap: 2 }}>
                  <Button
                    onClick={() => setShowModificationForm(false)}
                    variant="outlined"
                    disabled={isLoading}
                    sx={{ 
                      borderRadius: 2,
                      px: 3,
                      py: 1
                    }}
                  >
                    Annuler
                  </Button>
                  <GradientButton
                    type="submit"
                    disabled={isLoading}
                    sx={{ px: 3, py: 1 }}
                  >
                    {isLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} color="inherit" />
                        Confirmation en cours...
                      </Box>
                    ) : (
                      'Confirmer l\'importation'
                    )}
                  </GradientButton>
                </CardActions>
              </StyledCard>
            </form>
          )}
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}