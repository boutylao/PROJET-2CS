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

import { useSelection } from '@/hooks/use-selection';
import { Button } from '@mui/material';

function noop(): void {
  // do nothing
}

export interface Operation {
  id: string;
  name: string;
  drillingSite: string;
  operationType: string;
  date: Date;
  time: string;
  reportUrl: string;
  createdAt: Date;
}

interface OperationsTableProps {
  count?: number;
  page?: number;
  rows?: Operation[];
  rowsPerPage?: number;
}

export function OperationsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}: OperationsTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((operation) => operation.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;



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
              <TableCell>Date</TableCell>
              <TableCell>Heure</TableCell>
              <TableCell>Rapport</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected?.has(row.id);
              const formattedDate = dayjs(row.date).format('DD/MM/YYYY');

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
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
                  <TableCell>{formattedDate}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>
                  <Button
                      variant="contained"
                      size="small"
                      component="a"
                      href={row.reportUrl}
                      download
                      sx={{
                        backgroundColor: '#16DBAA',
                        '&:hover': {
                          backgroundColor: '#12b794', // Slightly darker shade for hover
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
        onPageChange={noop}
        onRowsPerPageChange={noop}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Lignes par page:"
        labelDisplayedRows={({ from, to, count: totalCount }) => `${from}-${to} sur ${totalCount}`}
      />
    </Card>
  );
}
