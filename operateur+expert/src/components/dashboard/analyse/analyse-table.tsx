'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import { File as FileIcon } from '@phosphor-icons/react/dist/ssr/File';
import { useSelection } from '@/hooks/use-selection';
import dayjs from 'dayjs';

export interface Analyse {
  id: string;
  operationType: string;
  drillingSite: string;
  costPrevu?: string;
  costReel?: string;
  delaiPrevu?: string;
  delaiReel?: string;
  date: Date;
  status: string;
  reportUrl: string;
}


interface AnalyseTableProps {
  count?: number;
  page?: number;
  rows?: Analyse[];
  rowsPerPage?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

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

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '1000px' }}>
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
              <TableCell>Coût prévu</TableCell>
              <TableCell>Coût réel</TableCell>
              <TableCell>Délai prévu</TableCell>
              <TableCell>Délai réel</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Rapport</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        event.stopPropagation();
                        event.target.checked ? selectOne(row.id) : deselectOne(row.id);
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.operationType}</TableCell>
                  <TableCell>{row.drillingSite}</TableCell>
                  <TableCell>{row.costPrevu ?? '-'}</TableCell>
                  <TableCell>{row.costReel ?? '-'}</TableCell>
                  <TableCell>{row.delaiPrevu ?? '-'}</TableCell>
                  <TableCell>{row.delaiReel ?? '-'}</TableCell>
                  <TableCell>{dayjs(row.date).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>
                    <Chip label={row.status} size="small" color="default" />
                  </TableCell>
                  <TableCell>
                  <IconButton
  color="primary"
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
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Lignes par page:"
      />
    </Card>
  );
}
