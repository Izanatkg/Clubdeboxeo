import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getProducts,
  deleteProduct,
  reset,
} from '../features/products/productSlice';
import { toast } from 'react-toastify';
import Layout from '../components/common/Layout';
import DataTable from '../components/common/DataTable';
import ProductForm from '../components/products/ProductForm';
import StockForm from '../components/products/StockForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';

function Products() {
  const [openForm, setOpenForm] = useState(false);
  const [openStockForm, setOpenStockForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
  });

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { products, isLoading, isError, message } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    dispatch(getProducts(filters));

    return () => {
      dispatch(reset());
    };
  }, [dispatch, isError, message, filters]);

  const handleOpenForm = (product = null) => {
    setSelectedProduct(product);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setSelectedProduct(null);
    setOpenForm(false);
  };

  const handleOpenStockForm = (product) => {
    setSelectedProduct(product);
    setOpenStockForm(true);
  };

  const handleCloseStockForm = () => {
    setSelectedProduct(null);
    setOpenStockForm(false);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteProduct(selectedProduct._id));
    setOpenConfirm(false);
    setSelectedProduct(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const getStockColor = (stock) => {
    if (stock <= 0) return 'error';
    if (stock <= 5) return 'warning';
    return 'success';
  };

  const columns = [
    { field: 'name', headerName: 'Nombre', minWidth: 200 },
    {
      field: 'type',
      headerName: 'Tipo',
      minWidth: 120,
      valueFormatter: ({ value }) => {
        const types = {
          consumable: 'Consumible',
          equipment: 'Equipo',
          clothing: 'Ropa',
        };
        return types[value] || value;
      },
    },
    {
      field: 'price',
      headerName: 'Precio',
      minWidth: 120,
      valueFormatter: ({ value }) => formatCurrency(value),
    },
    {
      field: 'stockUAN',
      headerName: 'Stock UAN',
      minWidth: 120,
      valueGetter: (params) => params.row.stock?.UAN || 0,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStockColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'stockVillas',
      headerName: 'Stock Villas',
      minWidth: 120,
      valueGetter: (params) => params.row.stock?.['Villas del Parque'] || 0,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStockColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Inventario',
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenStockForm(params.row);
          }}
        >
          <InventoryIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              Productos
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
            >
              Nuevo Producto
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Buscar"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                label="Tipo"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="consumable">Consumible</MenuItem>
                <MenuItem value="equipment">Equipo</MenuItem>
                <MenuItem value="clothing">Ropa</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <DataTable
        rows={products}
        columns={columns}
        loading={isLoading}
        onEdit={handleOpenForm}
        onDelete={handleDelete}
      />

      <ProductForm
        open={openForm}
        onClose={handleCloseForm}
        product={selectedProduct}
      />

      <StockForm
        open={openStockForm}
        onClose={handleCloseStockForm}
        product={selectedProduct}
      />

      <ConfirmDialog
        open={openConfirm}
        title="Eliminar Producto"
        message="¿Está seguro que desea eliminar este producto? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onClose={() => setOpenConfirm(false)}
      />
    </Layout>
  );
}

export default Products;
