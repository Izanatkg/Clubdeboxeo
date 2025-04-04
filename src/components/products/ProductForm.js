import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createProduct, updateProduct } from '../../features/products/productSlice';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
} from '@mui/material';

const LOCATIONS = ['Villas del Parque', 'UAN'];

function ProductForm({ open, onClose, product = null }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'consumable',
    price: '',
    description: '',
    allowInstallments: false,
    stock: {
      'Villas del Parque': 0,
      'UAN': 0
    }
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        type: product.type || 'consumable',
        price: product.price || '',
        description: product.description || '',
        allowInstallments: product.allowInstallments || false,
        stock: product.stock || {
          'Villas del Parque': 0,
          'UAN': 0
        }
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleStockChange = (location, value) => {
    setFormData((prevState) => ({
      ...prevState,
      stock: {
        ...prevState.stock,
        [location]: parseInt(value) || 0
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.type || !formData.price) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      if (product) {
        dispatch(updateProduct({ productId: product._id, productData: formData }));
      } else {
        dispatch(createProduct(formData));
      }
      toast.success(`Producto ${product ? 'actualizado' : 'creado'} exitosamente`);
      onClose();
    } catch (error) {
      toast.error('Error al guardar el producto');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Nombre"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select name="type" value={formData.type} onChange={handleChange}>
                <MenuItem value="consumable">Consumible</MenuItem>
                <MenuItem value="equipment">Equipo</MenuItem>
                <MenuItem value="clothing">Ropa</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="price"
              label="Precio"
              type="number"
              value={formData.price}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Descripción"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Stock por ubicación
            </Typography>
            {LOCATIONS.map((location) => (
              <TextField
                key={location}
                label={location}
                type="number"
                value={formData.stock[location]}
                onChange={(e) => handleStockChange(location, e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
            ))}
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.allowInstallments}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allowInstallments: e.target.checked,
                    }))
                  }
                />
              }
              label="Permitir pagos en abonos"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {product ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductForm;
