import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { getSales } from '../features/sales/salesSlice';

function Sales() {
  const dispatch = useDispatch();
  const { sales } = useSelector((state) => state.sales);

  useEffect(() => {
    dispatch(getSales());
  }, [dispatch]);

  // Calcular ventas del día
  const getDailySales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return sales
      .filter(sale => new Date(sale.date) >= today)
      .reduce((total, sale) => total + sale.total, 0);
  };

  // Calcular ventas del mes
  const getMonthlySales = () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    return sales
      .filter(sale => new Date(sale.date) >= firstDayOfMonth)
      .reduce((total, sale) => total + sale.total, 0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Resumen de Ventas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ventas del Día
              </Typography>
              <Typography variant="h5">
                ${getDailySales().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ventas del Mes
              </Typography>
              <Typography variant="h5">
                ${getMonthlySales().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Historial de Ventas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historial de Ventas
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale._id}>
                        <TableCell>
                          {new Date(sale.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {sale.product ? sale.product.name : 'Producto eliminado'}
                        </TableCell>
                        <TableCell align="right">{sale.quantity}</TableCell>
                        <TableCell align="right">
                          ${sale.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {sales.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No hay ventas registradas
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Sales;
