const jwt = require('jsonwebtoken');
// Project uses `Student.js` as the user model; require it here
const User = require('../models/Student');
const Faculty = require('../models/Faculty');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      // If not a regular user, check if it's a faculty
      if (!req.user) {
        req.user = await Faculty.findById(decoded.id).select('-password');
        if (req.user) req.user.role = 'faculty';
      } else {
        req.user.role = 'user';
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Middleware to check if user is faculty
const faculty = (req, res, next) => {
  if (req.user && (req.user.role === 'faculty' || req.user.isAdmin)) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as faculty' });
  }
};

module.exports = { protect, admin, faculty };
