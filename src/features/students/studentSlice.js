import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import studentService from './studentService';

const initialState = {
  students: [],
  total: 0,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all students
export const getStudents = createAsyncThunk(
  'students/getAll',
  async (filters, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await studentService.getStudents(token, filters);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new student
export const createStudent = createAsyncThunk(
  'students/create',
  async (studentData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await studentService.createStudent(studentData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update student
export const updateStudent = createAsyncThunk(
  'students/update',
  async ({ studentId, studentData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await studentService.updateStudent(studentId, studentData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete student
export const deleteStudent = createAsyncThunk(
  'students/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await studentService.deleteStudent(id, token);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStudents.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(getStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.students = Array.isArray(action.payload) ? action.payload : [];
        state.total = state.students.length;
        state.message = '';
      })
      .addCase(getStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })
      .addCase(createStudent.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message = 'Estudiante registrado exitosamente';
        state.students.push(action.payload);
        state.total += 1;
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })
      .addCase(updateStudent.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message = 'Estudiante actualizado exitosamente';
        state.students = state.students.map((student) =>
          student._id === action.payload._id ? action.payload : student
        );
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })
      .addCase(deleteStudent.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message = 'Estudiante eliminado exitosamente';
        state.students = state.students.filter(
          (student) => student._id !== action.payload
        );
        state.total -= 1;
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      });
  },
});

export const { reset } = studentSlice.actions;
export default studentSlice.reducer;
