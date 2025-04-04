import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getProducts } from '../features/products/productSlice';
import { useNavigate } from 'react-router-dom';
import { createSale } from '../features/sales/salesSlice';
import { toast } from 'react-toastify';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Container,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const getStockColor = (stock) => {
    if (!stock) return 'error';
    const totalStock = Object.values(stock).reduce((a, b) => a + b, 0);
    if (totalStock === 0) return 'error';
    if (totalStock < 5) return 'warning';
    return 'success';
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'Nombre', 
      flex: 1 
    },
    { 
      field: 'type', 
      headerName: 'Tipo', 
      width: 130,
      valueFormatter: (params) => {
        const types = {
          consumable: 'Consumible',
          equipment: 'Equipo',
          clothing: 'Ropa'
        };
        return types[params.value] || params.value;
      }
    },
    { 
      field: 'price', 
      headerName: 'Precio', 
      width: 130,
      valueFormatter: (params) => {
        return params.value ? `$${Number(params.value).toFixed(2)}` : '$0.00';
      }
    },
    {
      field: 'stock',
      headerName: 'Stock Total',
      width: 130,
      renderCell: (params) => {
        const stock = params.value || {};
        const totalStock = Object.values(stock).reduce((a, b) => a + b, 0);
        return (
          <Chip
            label={totalStock}
            color={getStockColor(stock)}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 130,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<AddShoppingCartIcon />}
          onClick={() => handleAddToCart(params.row)}
          disabled={!params.row.stock || Object.values(params.row.stock).reduce((a, b) => a + b, 0) === 0}
        >
          Vender
        </Button>
      ),
    },
  ];

  const handleAddToCart = async (product) => {
    try {
      // Encontrar la primera ubicación con stock disponible
      const stockEntries = Object.entries(product.stock || {});
      const [location] = stockEntries.find(([_, qty]) => qty > 0) || [];

      if (!location) {
        toast.error('No hay stock disponible');
        return;
      }

      const saleData = {
        productId: product._id,
        quantity: 1,
        location
      };
      
      const result = await dispatch(createSale(saleData)).unwrap();
      if (result) {
        toast.success('Venta realizada con éxito');
        dispatch(getProducts());
      }
    } catch (error) {
      console.error('Error al procesar venta:', error);
      toast.error(error?.response?.data?.message || 'Error al procesar la venta');
    }
  };

  const calculateInventoryValue = () => {
    return products.reduce((total, product) => {
      if (!product.stock || !product.price) return total;
      const stockTotal = Object.values(product.stock).reduce((a, b) => a + b, 0);
      return total + (stockTotal * product.price);
    }, 0);
  };

  const getProductsWithoutStock = () => {
    return products.filter(product => {
      if (!product.stock) return true;
      return Object.values(product.stock).reduce((a, b) => a + b, 0) === 0;
    }).length;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Resumen de Productos */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Productos
              </Typography>
              <Typography variant="h5">
                {products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Productos sin Stock */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Productos sin Stock
              </Typography>
              <Typography variant="h5">
                {getProductsWithoutStock()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Valor del Inventario */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Valor del Inventario
              </Typography>
              <Typography variant="h5">
                ${calculateInventoryValue().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Productos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Productos Disponibles
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={products}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  getRowId={(row) => row._id}
                  disableSelectionOnClick
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
