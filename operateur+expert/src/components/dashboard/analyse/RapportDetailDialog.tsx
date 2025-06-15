'use client';

import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box,
  Accordion, AccordionSummary, AccordionDetails, Grid, TextField, Table, TableHead,
  TableBody, TableRow, TableCell, IconButton, Paper, TableContainer, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CommentIcon from '@mui/icons-material/Comment';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

// Styled Components (identiques à ceux de import-document.tsx)
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px !important',
  boxShadow: 'none',
  '&:before': { display: 'none' },
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

export function RapportDetailDialog({
  open,
  onClose,
  rapportData,
}: {
  open: boolean;
  onClose: () => void;
  rapportData: any;
}): React.JSX.Element {
  if (!rapportData) return <></>;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={600}>
          Détails du Rapport - Jour {rapportData.report?.day ?? 'N/A'}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
  <Typography variant="subtitle1">
    <strong>Puits :</strong> {rapportData.puitName ?? 'N/A'} &nbsp;|&nbsp;
    <strong>ID :</strong> {rapportData.id ?? 'N/A'} &nbsp;|&nbsp;
    <strong>Jour :</strong> {rapportData.day ?? 'N/A'}
  </Typography>
</Box>


        {/* Informations Générales */}
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
        <TextField fullWidth label="Phase" value={rapportData.phase ?? ''} InputProps={{ readOnly: true }} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField fullWidth label="Profondeur (ft)" value={rapportData.depth ?? ''} InputProps={{ readOnly: true }} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField fullWidth label="TVD (ft)" value={rapportData.tvd ?? ''} InputProps={{ readOnly: true }} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField fullWidth label="Heures de Forage" value={rapportData.drillingHours ?? ''} InputProps={{ readOnly: true }} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField fullWidth label="Progrès de Forage" value={rapportData.drillingProgress ?? ''} InputProps={{ readOnly: true }} />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Opération Planifiée"
          value={rapportData.plannedOperation ?? ''}
          InputProps={{ readOnly: true }}
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
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Taux</TableCell>
                    <TableCell>Début</TableCell>
                    <TableCell>Fin</TableCell>
                    <TableCell>Prof. Init.</TableCell>
                    <TableCell>Prof. Fin</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rapportData.operations?.map((op: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{op.code}</TableCell>
                      <TableCell>{op.rate}</TableCell>
                      <TableCell>{op.startTime}</TableCell>
                      <TableCell>{op.endTime}</TableCell>
                      <TableCell>{op.initialDepth}</TableCell>
                      <TableCell>{op.finalDepth}</TableCell>
                      <TableCell>{op.description}</TableCell>
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
              {Object.entries(rapportData.dailyCost || {}).map(([key, value]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <TextField
                    fullWidth
                    label={key}
                    value={value}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </StyledAccordion>

        {/* Remarques */}
        {rapportData.remarks?.length > 0 && (
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
              <Grid container spacing={2}>
                {rapportData.remarks.map((remark: string, index: number) => (
                  <Grid item xs={12} key={index}>
                    <TextField
                      fullWidth
                      multiline
                      value={remark}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </StyledAccordion>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
