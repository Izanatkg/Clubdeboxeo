import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getStudents,
  deleteStudent,
  reset,
} from '../features/students/studentSlice';
import { toast } from 'react-toastify';
import Layout from '../components/common/Layout';
import DataTable from '../components/common/DataTable';
import StudentForm from '../components/students/StudentForm';
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
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function Students() {
  const [openForm, setOpenForm] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'active',
    gym: '',
  });

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { students = [], isLoading, isError, message } = useSelector(
    (state) => state.students
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    dispatch(
      getStudents({
        ...filters,
        gym: user.role === 'admin' ? filters.gym : user.assignedGym,
      })
    );

    return () => {
      dispatch(reset());
    };
  }, [dispatch, isError, message, filters, user]);

  const handleOpenForm = (student = null) => {
    setSelectedStudent(student);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setSelectedStudent(null);
    setOpenForm(false);
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteStudent(selectedStudent._id));
    setOpenConfirm(false);
    setSelectedStudent(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  const getPaymentStatus = (lastPayment, nextPaymentDate) => {
    if (!nextPaymentDate) return 'Sin pagos';
    
    const today = new Date();
    const nextPayment = new Date(nextPaymentDate);
    
    if (nextPayment < today) {
      return 'Vencido';
    }
    
    const daysUntilPayment = Math.ceil((nextPayment - today) / (1000 * 60 * 60 * 24));
    if (daysUntilPayment <= 7) {
      return 'Próximo a vencer';
    }
    
    return 'Al día';
  };

  const columns = [
    { field: 'name', headerName: 'Nombre', minWidth: 200 },
    { field: 'phone', headerName: 'Teléfono', minWidth: 150 },
    {
      field: 'membershipType',
      headerName: 'Membresía',
      minWidth: 120,
      valueFormatter: ({ value }) => {
        const types = {
          monthly: 'Mensual',
          weekly: 'Semanal',
          class: 'Por Clase'
        };
        return types[value] || value;
      }
    },
    {
      field: 'lastPayment',
      headerName: 'Último Pago',
      minWidth: 120,
      valueFormatter: ({ value }) => formatDate(value)
    },
    {
      field: 'nextPaymentDate',
      headerName: 'Próximo Pago',
      minWidth: 120,
      valueFormatter: ({ value }) => formatDate(value)
    },
    {
      field: 'paymentStatus',
      headerName: 'Estado de Pago',
      minWidth: 150,
      renderCell: (params) => {
        const status = getPaymentStatus(params.row.lastPayment, params.row.nextPaymentDate);
        let color = 'default';
        
        switch (status) {
          case 'Vencido':
            color = 'error';
            break;
          case 'Próximo a vencer':
            color = 'warning';
            break;
          case 'Al día':
            color = 'success';
            break;
          default:
            color = 'default';
        }
        
        return <Chip label={status} color={color} size="small" />;
      }
    },
    {
      field: 'status',
      headerName: 'Estado',
      minWidth: 120,
      valueFormatter: ({ value }) =>
        value === 'active' ? 'Activo' : 'Inactivo',
    },
    {
      field: 'gym',
      headerName: 'Gimnasio',
      minWidth: 120,
      hide: user.role !== 'admin',
      valueFormatter: ({ value }) =>
        value === 'UAN' ? 'UAN' : 'Villas del Parque',
    },
  ];

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              Estudiantes
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
            >
              Nuevo Estudiante
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Buscar"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Estado"
              >
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
                <MenuItem value="">Todos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {user.role === 'admin' && (
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Gimnasio</InputLabel>
                <Select
                  name="gym"
                  value={filters.gym}
                  onChange={handleFilterChange}
                  label="Gimnasio"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="UAN">UAN</MenuItem>
                  <MenuItem value="Villas del Parque">Villas del Parque</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Box>

      <DataTable
        rows={students}
        columns={columns}
        loading={isLoading}
        onEdit={handleOpenForm}
        onDelete={handleDelete}
      />

      <StudentForm
        open={openForm}
        onClose={handleCloseForm}
        student={selectedStudent}
      />

      <ConfirmDialog
        open={openConfirm}
        title="Eliminar Estudiante"
        message="¿Está seguro que desea eliminar este estudiante? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onClose={() => setOpenConfirm(false)}
      />
    </Layout>
  );
}

export default Students;
