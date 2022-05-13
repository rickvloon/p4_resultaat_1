const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.get('/', authController.validateToken, userController.getAllUsers);

router.post('/', userController.validateUser, userController.createUser);

router.get('/profile', authController.validateToken, userController.getUserProfile);

router.get('/:id', authController.validateToken, userController.getUser);

router.put('/:id', authController.validateToken, userController.validateUser, userController.updateUser);

router.delete('/:id', authController.validateToken, userController.deleteUser);

module.exports = router;
