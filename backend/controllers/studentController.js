const asyncHandler = require('express-async-handler');
const Student = require('../models/studentModel');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = asyncHandler(async (req, res) => {
  const { gym, status, search } = req.query;
  let query = {};

  // Filter by gym if user is not admin
  if (req.user.role !== 'admin') {
    query.gym = req.user.assignedGym;
  } else if (gym) {
    query.gym = gym;
  }

  // Filter by status if provided
  if (status) {
    query.status = status;
  }

  // Search by name if provided
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const students = await Student.find(query).sort({ name: 1 });
  res.json(students);
});

// @desc    Create new student
// @route   POST /api/students
// @access  Private
const createStudent = asyncHandler(async (req, res) => {
  const { name, phone, gym, membershipType, photoUrl } = req.body;

  if (!name || !phone || !gym || !membershipType) {
    res.status(400);
    throw new Error('Por favor complete todos los campos requeridos');
  }

  // Check if student with same phone exists
  const studentExists = await Student.findOne({ phone });
  if (studentExists) {
    res.status(400);
    throw new Error('Ya existe un estudiante con este número de teléfono');
  }

  const student = await Student.create({
    name,
    phone,
    gym,
    membershipType,
    photoUrl,
    enrollmentDate: new Date(),
    status: 'active',
  });

  if (student) {
    res.status(201).json(student);
  } else {
    res.status(400);
    throw new Error('Datos de estudiante inválidos');
  }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Estudiante no encontrado');
  }

  // Check if user has permission to update this student
  if (req.user.role !== 'admin' && student.gym !== req.user.assignedGym) {
    res.status(401);
    throw new Error('No autorizado para actualizar este estudiante');
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedStudent);
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Estudiante no encontrado');
  }

  // Check if user has permission to delete this student
  if (req.user.role !== 'admin' && student.gym !== req.user.assignedGym) {
    res.status(401);
    throw new Error('No autorizado para eliminar este estudiante');
  }

  await student.deleteOne();
  res.json({ id: req.params.id, message: 'Estudiante eliminado exitosamente' });
});

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Estudiante no encontrado');
  }

  // Check if user has permission to view this student
  if (req.user.role !== 'admin' && student.gym !== req.user.assignedGym) {
    res.status(401);
    throw new Error('No autorizado para ver este estudiante');
  }

  res.json(student);
});

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
};
