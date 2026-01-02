const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Admin Auth
router.post('/admin/login', authController.adminLogin);
router.post('/admin/logout', authController.logout);

// Faculty Auth
router.post('/faculty/login', authController.facultyLogin);
router.post('/faculty/logout', authController.logout);

// Student Auth
router.post('/students/login', authController.studentLogin);
router.post('/students/register', authController.studentRegister);
router.post('/students/logout', authController.logout);

module.exports = router;
