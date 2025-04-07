import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' ? 'https://club-de-boxeo-parra.onrender.com/api/students/' : '/api/students/';

// Get all students
const getStudents = async (token, filters = {}) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: filters,
  };

  const response = await axios.get(API_URL, config);
  return response.data;
};

// Create new student
const createStudent = async (studentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, studentData, config);
  return response.data;
};

// Update student
const updateStudent = async (studentId, studentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(API_URL + studentId, studentData, config);
  return response.data;
};

// Delete student
const deleteStudent = async (studentId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + studentId, config);
  return response.data;
};

const studentService = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};

export default studentService;
