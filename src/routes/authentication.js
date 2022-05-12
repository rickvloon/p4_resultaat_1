const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.validateLogin, authController.login);

module.exports = router;