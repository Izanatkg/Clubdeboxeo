import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';

function DataTable({ rows = [], columns, loading, onDelete, onEdit }) {
  // Asegurarse de que rows sea siempre un array
  const safeRows = Array.isArray(rows) ? rows : [];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useSelector((state) => state.auth);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!safeRows.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <Typography variant="body1" color="textSecondary">
          No hay datos para mostrar
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) =>
                column.hide ? null : (
                  <TableCell
                    key={column.field}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.headerName}
                  </TableCell>
                )
              )}
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                    {columns.map((column) =>
                      column.hide ? null : (
                        <TableCell key={column.field}>
                          {column.valueGetter
                            ? column.valueGetter({ row })
                            : column.valueFormatter
                            ? column.valueFormatter({ value: row[column.field] })
                            : row[column.field]}
                        </TableCell>
                      )
                    )}
                    <TableCell>
                      {onEdit && (
                        <IconButton
                          color="primary"
                          onClick={() => onEdit(row)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {onDelete && user.role === 'admin' && (
                        <IconButton
                          color="error"
                          onClick={() => onDelete(row)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
    </Paper>
  );
}

export default DataTable;
