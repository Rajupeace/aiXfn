const Student = require('../models/Student');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private/Admin
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a student
// @route   POST /api/students
// @access  Private/Admin
exports.createStudent = async (req, res) => {
  try {
    const { sid, studentName, email, password, branch, year, section } = req.body;

    // Check if student already exists
    let student = await Student.findOne({ $or: [{ sid }, { email }] });
    
    if (student) {
      return res.status(400).json({ message: 'Student already exists with this ID or email' });
    }

    // Create new student
    student = new Student({
      sid,
      studentName,
      email,
      password, // In production, make sure to hash the password before saving
      branch,
      year,
      section
    });

    await student.save();
    
    // Remove password from the response
    student.password = undefined;
    
    res.status(201).json(student);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
  try {
    const { studentName, email, branch, year, section, phone, address } = req.body;
    
    // Build student object
    const studentFields = {};
    if (studentName) studentFields.studentName = studentName;
    if (email) studentFields.email = email;
    if (branch) studentFields.branch = branch;
    if (year) studentFields.year = year;
    if (section) studentFields.section = section;
    if (phone) studentFields.phone = phone;
    if (address) studentFields.address = address;

    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if email is being updated to an existing email
    if (email && email !== student.email) {
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: studentFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(student);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.remove();
    
    res.json({ message: 'Student removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};
