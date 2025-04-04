import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateStock } from '../../features/products/productSlice';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';

function StockForm({ open, onClose, product }) {
  const [formData, setFormData] = useState({
    'Villas del Parque': 0,
    'UAN': 0,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (product && product.stock) {
      setFormData({
        'Villas del Parque': product.stock['Villas del Parque'] || 0,
        'UAN': product.stock['UAN'] || 0,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const stockData = {
      stock: formData,
    };

    dispatch(updateStock({ id: product._id, stockData }))
      .unwrap()
      .then(() => {
        toast.success('Inventario actualizado exitosamente');
        onClose();
      })
      .catch((error) => {
        toast.error(error || 'Error al actualizar el inventario');
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Actualizar Inventario - {product?.name}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stock en UAN"
              name="UAN"
              type="number"
              value={formData['UAN']}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stock en Villas del Parque"
              name="Villas del Parque"
              type="number"
              value={formData['Villas del Parque']}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StockForm;
