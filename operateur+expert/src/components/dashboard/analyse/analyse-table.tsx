'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { File as FileIcon } from '@phosphor-icons/react/dist/ssr/File';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import dayjs from 'dayjs';

import { useSelection } from '@/hooks/use-selection';

function noop(): void {
  // do nothing
}

export interface Analyse {
  id: string;
  name: string;
  drillingSite: string;
  operationType: string;
  cost: string;
  delay: string;
  date: Date;
  time: string;
  problem: string;
  reportUrl: string;
  status: string;
  createdAt: Date;
}

interface AnalyseTableProps {
  count?: number;
  page?: number;
  rows?: Analyse[];
  rowsPerPage?: number;
  onOpenForm?: (rapportId: string) => void;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AnalyseTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onOpenForm,
  onPageChange,
  onRowsPerPageChange,
}: AnalyseTableProps): React.JSX.Element {
  const [selectedRapport, setSelectedRapport] = React.useState<string | null>(null);
  const [expertAnalysis, setExpertAnalysis] = React.useState('');
  const [recommendation, setRecommendation] = React.useState('');

  const rowIds = React.useMemo(() => {
    return rows.map((operation) => operation.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  // Fonction pour déterminer la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complété':
        return 'success';
      case 'En cours':
        return 'info';
      case 'Planifié':
        return 'warning';
      case 'Annulé':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleRowClick = (rapportId: string) => {
    setSelectedRapport(rapportId === selectedRapport ? null : rapportId);
    if (onOpenForm) {
      onOpenForm(rapportId);
    }
  };

  const handleSubmitAnalysis = () => {
    // Logique pour soumettre l'analyse au décideur
    // eslint-disable-next-line no-console -- Allow console.log for debugging in development mode
    console.log({
      rapportId: selectedRapport,
      expertAnalysis,
      recommendation
    });
    // eslint-disable-next-line no-alert -- Allow alert for user feedback
    alert('Analyse envoyée au décideur avec succès!');
    // Réinitialiser les champs après l'envoi
    setExpertAnalysis('');
    setRecommendation('');
    setSelectedRapport(null);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={selectedRapport ? 7 : 12}>
        <Card>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedAll}
                      indeterminate={selectedSome}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectAll();
                        } else {
                          deselectAll();
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Opération</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Site de forage</TableCell>
                  <TableCell>Coût</TableCell>
                  <TableCell>Délai</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Heure</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Rapport</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const isSelected = selected?.has(row.id);
                  const isRowSelected = row.id === selectedRapport;
                  const formattedDate = dayjs(row.date).format('DD/MM/YYYY');

                  return (
                    <TableRow
                      hover
                      key={row.id}
                      selected={isRowSelected}
                      onClick={() => {handleRowClick(row.id);}}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox" onClick={(e) => {e.stopPropagation();}}>
                        <Checkbox
                          checked={isSelected}
                          onChange={(event) => {
                            if (event.target.checked) {
                              selectOne(row.id);
                            } else {
                              deselectOne(row.id);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{row.name}</Typography>
                      </TableCell>
                      <TableCell>{row.operationType}</TableCell>
                      <TableCell>{row.drillingSite}</TableCell>
                      <TableCell>{row.cost}</TableCell>
                      <TableCell>{row.delay}</TableCell>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell>{row.time}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={getStatusColor(row.status)}
                        />
                      </TableCell>
                      <TableCell onClick={(e) => {e.stopPropagation();}}>
                        <IconButton
                          color="primary"
                          aria-label="télécharger rapport"
                          component="a"
                          href={row.reportUrl}
                          download
                        >
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
            onPageChange={onPageChange || noop}
            onRowsPerPageChange={onRowsPerPageChange || noop}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count: totalCount }) => `${from}-${to} sur ${totalCount}`}
          />
        </Card>
      </Grid>

      {selectedRapport && (
        <Grid item xs={12} md={5}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Analyse de l expert
            </Typography>

            <TextField
              label="Analyse détaillée"
              multiline
              rows={6}
              fullWidth
              value={expertAnalysis}
              onChange={(e) => {setExpertAnalysis(e.target.value);}}
              margin="normal"
              placeholder="Entrez votre analyse détaillée de l'opération..."
            />

            <TextField
              label="Recommandations"
              multiline
              rows={4}
              fullWidth
              value={recommendation}
              onChange={(e) => {setRecommendation(e.target.value);}}
              margin="normal"
              placeholder="Entrez vos recommandations..."
            />

            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<CheckCircleIcon fontSize="var(--icon-fontSize-md)" />}
                onClick={handleSubmitAnalysis}
                sx={{ mt: 2 }}
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
