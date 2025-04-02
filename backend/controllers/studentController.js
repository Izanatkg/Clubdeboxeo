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
    throw new Error('Please fill in all required fields');
  }

  // Check if student with same phone exists
  const studentExists = await Student.findOne({ phone });
  if (studentExists) {
    res.status(400);
    throw new Error('Student with this phone number already exists');
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
    throw new Error('Invalid student data');
  }
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Check if user has permission to update this student
  if (req.user.role !== 'admin' && student.gym !== req.user.assignedGym) {
    res.status(401);
    throw new Error('Not authorized to update this student');
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
    throw new Error('Student not found');
  }

  // Check if user has permission to delete this student
  if (req.user.role !== 'admin' && student.gym !== req.user.assignedGym) {
    res.status(401);
    throw new Error('Not authorized to delete this student');
  }

  await student.remove();
  res.json({ id: req.params.id });
});

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Check if user has permission to view this student
  if (req.user.role !== 'admin' && student.gym !== req.user.assignedGym) {
    res.status(401);
    throw new Error('Not authorized to view this student');
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
