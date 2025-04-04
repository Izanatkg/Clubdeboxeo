import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { createPayment, reset as resetPayment } from '../../features/payments/paymentSlice';
import { getStudents } from '../../features/students/studentSlice';
import { addMonths, addDays } from 'date-fns';

function PaymentForm({ open, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { students, isLoading: isLoadingStudents } = useSelector((state) => state.students);
  const { isError, isSuccess, message } = useSelector((state) => state.payments);

  const [formData, setFormData] = useState({
    student: '',
    amount: '',
    paymentType: '',
    paymentMethod: '',
    paymentDate: new Date(),
    concept: '',
    gym: user.role === 'admin' ? '' : user.assignedGym,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch students when form opens or search term changes
  useEffect(() => {
    if (open) {
      dispatch(getStudents({
        gym: user.role === 'admin' ? '' : user.assignedGym,
        status: 'active',
        search: debouncedSearchTerm
      }));
    }
  }, [dispatch, user.role, user.assignedGym, open, debouncedSearchTerm]);

  // Handle success/error states
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success('Pago registrado exitosamente');
      dispatch(resetPayment());
      onClose();
    }
  }, [isError, isSuccess, message, dispatch, onClose]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        student: '',
        amount: '',
        paymentType: '',
        paymentMethod: '',
        paymentDate: new Date(),
        concept: '',
        gym: user.role === 'admin' ? '' : user.assignedGym,
      });
      setSearchTerm('');
    }
  }, [open, user.role, user.assignedGym]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      paymentDate: date,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.student || !formData.amount || !formData.paymentType || !formData.paymentMethod) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    // Validar que el monto sea un número positivo
    if (parseFloat(formData.amount) <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    dispatch(createPayment({
      student: formData.student,
      amount: parseFloat(formData.amount),
      paymentType: formData.paymentType,
      paymentMethod: formData.paymentMethod,
      paymentDate: formData.paymentDate,
      comments: formData.concept || '',
      gym: formData.gym,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nuevo Pago</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Buscar estudiante"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth required>
              <InputLabel>Estudiante</InputLabel>
              <Select
                name="student"
                value={formData.student}
                onChange={handleChange}
                label="Estudiante"
              >
                {isLoadingStudents ? (
                  <MenuItem disabled>Cargando estudiantes...</MenuItem>
                ) : students.length === 0 ? (
                  <MenuItem disabled>No se encontraron estudiantes</MenuItem>
                ) : (
                  students.map((student) => (
                    <MenuItem key={student._id} value={student._id}>
                      {student.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Monto"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de pago</InputLabel>
              <Select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                label="Tipo de pago"
              >
                <MenuItem value="monthly">Mensual</MenuItem>
                <MenuItem value="weekly">Semanal</MenuItem>
                <MenuItem value="class">Clase</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Método de pago</InputLabel>
              <Select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                label="Método de pago"
              >
                <MenuItem value="cash">Efectivo</MenuItem>
                <MenuItem value="card">Tarjeta</MenuItem>
                <MenuItem value="transfer">Transferencia</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
              <DatePicker
                label="Fecha de pago"
                value={formData.paymentDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Concepto (opcional)"
              name="concept"
              value={formData.concept}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>

          {user.role === 'admin' && (
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Gimnasio</InputLabel>
                <Select
                  name="gym"
                  value={formData.gym}
                  onChange={handleChange}
                  label="Gimnasio"
                >
                  <MenuItem value="uan">UAN</MenuItem>
                  <MenuItem value="villas">Villas del Parque</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PaymentForm;
