'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { Button } from '@mui/material';
import { useSelection } from '@/hooks/use-selection';

function noop(): void {}

export interface Operation {
  id: string;
  name: string;
  drillingSite: string;
  operationType: string; // Représente ici la phase
  date: Date;
  time: string;
  reportUrl: string;
  createdAt: Date;
  excelFile: string;
}

interface OperationsTableProps {
  count: number;
  page: number;
  rows: Operation[];
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function downloadFileFromUrl(url: string, filename: string): void {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Échec du téléchargement');
      }
      return response.blob();
    })
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch((err) => {
      console.error('Erreur de téléchargement:', err);
      alert("Le fichier est introuvable ou invalide.");
    });
}

export function OperationsTable({
  count,
  rows,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: OperationsTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((operation) => operation.id), [rows]);
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = selected.size > 0 && selected.size < rows.length;
  const selectedAll = rows.length > 0 && selected.size === rows.length;

  return (
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
                    event.target.checked ? selectAll() : deselectAll();
                  }}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Phase</TableCell>
              <TableCell>Site de forage</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Heure</TableCell>
              <TableCell>Rapport</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected.has(row.id);
              const formattedDate = dayjs(row.date).format('DD/MM/YYYY');

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) =>
                        event.target.checked ? selectOne(row.id) : deselectOne(row.id)
                      }
                    />
                  </TableCell>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.operationType}</TableCell>
                  <TableCell>{row.drillingSite}</TableCell>
                  <TableCell>{formattedDate}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>
                  <Button
  variant="contained"
  size="small"
  onClick={() => downloadFileFromUrl(row.reportUrl, `${row.id}.xlsx`)}
  sx={{
    backgroundColor: '#16DBAA',
    '&:hover': {
      backgroundColor: '#12b794',
    },
  }}
>
  Télécharger
</Button>
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
  onPageChange={onPageChange}
  onRowsPerPageChange={onRowsPerPageChange}
  page={page}
  rowsPerPage={rowsPerPage}
  rowsPerPageOptions={[5, 10, 25]}
  labelRowsPerPage="Lignes par page :"
  labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
/>
    </Card>
  );
}
