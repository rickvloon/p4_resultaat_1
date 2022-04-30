const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.get('/', userController.listUsers);

router.post('/', userController.validateUser, userController.createUser);

router.get('/profile', userController.getUserProfile);

router.get('/:id', userController.getUser);

router.put('/:id', userController.updateUser);

router.delete('/:id', userController.deleteUser);

module.exports = router;