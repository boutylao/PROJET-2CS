'use client';

import * as React from 'react';
import {
  Box, Card, Checkbox, Divider, IconButton, Table, TableBody, TableCell, TableHead,
  TablePagination, TableRow, Chip, Grid, Paper, TextField, Button, Typography
} from '@mui/material';
import { File as FileIcon } from '@phosphor-icons/react/dist/ssr/File';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { useSelection } from '@/hooks/use-selection';
import dayjs from 'dayjs';
import { green, orange, red, yellow } from '@mui/material/colors';

export interface Analyse {
  id: string;
  operationType: string;
  drillingSite: string;
  costPrevu?: string;
  costReel?: string;
  delaiPrevu?: string;
  delaiReel?: string;
  couleurCout?: string;
  couleurDelai?: string;
  dailyCost?: string;
  date: Date;
  status: string;
  reportUrl: string;
}

interface AnalyseTableProps {
  count?: number;
  page?: number;
  rows?: Analyse[];
  rowsPerPage?: number;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const getColor = (code: string | undefined) => {
  switch (code) {
    case 'V': return green[600];
    case 'O': return orange[700];
    case 'R': return red[700];
    default: return undefined;
  }
};

export function AnalyseTable({
  count = 0,
  page = 0,
  rows = [],
  rowsPerPage = 0,
  onPageChange,
  onRowsPerPageChange,
}: AnalyseTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((row) => row.id), [rows]);
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  const selectedSome = selected.size > 0 && selected.size < rows.length;
  const selectedAll = rows.length > 0 && selected.size === rows.length;

  const [selectedRapport, setSelectedRapport] = React.useState<string | null>(null);
  const [expertAnalysis, setExpertAnalysis] = React.useState('');
  const [recommendation, setRecommendation] = React.useState('');

  const handleSubmitReview = async () => {
    if (!selectedRapport) return;
    const reportId = selectedRapport.replace('REP-', '');

    try {
      const response = await fetch(`http://localhost:8099/api/reports/${reportId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertAnalysis,
          expertRecommendations: recommendation,
        }),
      });

      if (response.ok) {
        alert('Analyse envoyée au décideur avec succès.');
        setExpertAnalysis('');
        setRecommendation('');
        setSelectedRapport(null);
      } else {
        alert('Erreur lors de l’envoi de l’analyse.');
      }
    } catch (err) {
      alert('Erreur réseau.');
      console.error(err);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={selectedRapport ? 7 : 12}>
        <Card>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '1000px' }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedAll}
                      indeterminate={selectedSome}
                      onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                    />
                  </TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Phase</TableCell>
                  <TableCell>Site de forage</TableCell>
                  <TableCell>Coût prévu</TableCell>
                  <TableCell>Coût réel</TableCell>
                  <TableCell>Délai prévu</TableCell>
                  <TableCell>Délai réel</TableCell>
                  <TableCell>Coût journalier</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Rapport</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const isSelected = selected.has(row.id);
                  const isClicked = selectedRapport === row.id;
                  return (
                    <TableRow
                      hover
                      key={row.id}
                      selected={isClicked}
                      onClick={() => setSelectedRapport(isClicked ? null : row.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            e.target.checked ? selectOne(row.id) : deselectOne(row.id);
                          }}
                        />
                      </TableCell>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.operationType}</TableCell>
                      <TableCell>{row.drillingSite}</TableCell>
                      <TableCell sx={{ color: yellow[800], fontWeight: 600 }}>{row.costPrevu ?? '-'}</TableCell>
                      <TableCell sx={{ color: getColor(row.couleurCout), fontWeight: 600 }}>{row.costReel ?? '-'}</TableCell>
                      <TableCell sx={{ color: yellow[800], fontWeight: 600 }}>{row.delaiPrevu ?? '-'}</TableCell>
                      <TableCell sx={{ color: getColor(row.couleurDelai), fontWeight: 600 }}>{row.delaiReel ?? '-'}</TableCell>
                      <TableCell>{row.dailyCost ?? '-'}</TableCell>
                      <TableCell>{dayjs(row.date).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>
  <Chip
    label={row.status}
    size="small"
    sx={{
      fontWeight: 'bold',
      backgroundColor: row.status === 'Complété' ? 'success.main' : 'error.main',
      color: 'white',
    }}
  />
</TableCell>

                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <IconButton color="primary" component="a" href={row.reportUrl} download>
                          <FileIcon fontSize="var(--icon-fontSize-md)" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
          <Divider />
          <TablePagination
  component="div"
  count={count}
  page={page}
  rowsPerPage={rowsPerPage}
  onPageChange={onPageChange}
  onRowsPerPageChange={onRowsPerPageChange}
  rowsPerPageOptions={[5, 10, 25]}
  labelRowsPerPage="Lignes par page:"
/>

        </Card>
      </Grid>

      {selectedRapport && (
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }} elevation={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Analyse de l'expert
            </Typography>

            <TextField
              label="Analyse détaillée"
              multiline
              rows={6}
              fullWidth
              value={expertAnalysis}
              onChange={(e) => setExpertAnalysis(e.target.value)}
              margin="normal"
              placeholder="Entrez votre analyse..."
            />
            <TextField
              label="Recommandations"
              multiline
              rows={4}
              fullWidth
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              margin="normal"
              placeholder="Entrez vos recommandations..."
            />

            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<CheckCircleIcon />}
                onClick={handleSubmitReview}
              >
                Valider & Envoyer au décideur
              </Button>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}
