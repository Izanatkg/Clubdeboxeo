import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStudent, updateStudent, reset } from '../../features/students/studentSlice';
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
  Grid,
} from '@mui/material';

function StudentForm({ open, onClose, student = null }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gym: '',
    status: 'active',
    membershipType: 'monthly',
    notes: '',
  });

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isError, isSuccess, message } = useSelector((state) => state.students);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        phone: student.phone || '',
        email: student.email || '',
        gym: student.gym || '',
        status: student.status || 'active',
        membershipType: student.membershipType || 'monthly',
        notes: student.notes || '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        gym: user.role === 'admin' ? '' : user.assignedGym,
        status: 'active',
        membershipType: 'monthly',
        notes: '',
      });
    }
  }, [student, user]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success(student ? 'Estudiante actualizado exitosamente' : 'Estudiante creado exitosamente');
      dispatch(reset());
      onClose();
    }
  }, [isError, isSuccess, message, dispatch, onClose, student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.gym || !formData.membershipType) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    if (student) {
      dispatch(updateStudent({ studentId: student._id, studentData: formData }));
    } else {
      dispatch(createStudent(formData));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{student ? 'Editar Estudiante' : 'Nuevo Estudiante'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Estado</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Estado"
              >
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Membresía</InputLabel>
              <Select
                name="membershipType"
                value={formData.membershipType}
                onChange={handleChange}
                label="Tipo de Membresía"
              >
                <MenuItem value="monthly">Mensual</MenuItem>
                <MenuItem value="weekly">Semanal</MenuItem>
                <MenuItem value="class">Por Clase</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {user.role === 'admin' && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Gimnasio</InputLabel>
                <Select
                  name="gym"
                  value={formData.gym}
                  onChange={handleChange}
                  label="Gimnasio"
                >
                  <MenuItem value="UAN">UAN</MenuItem>
                  <MenuItem value="Villas del Parque">Villas del Parque</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notas"
              name="notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {student ? 'Actualizar' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StudentForm;
