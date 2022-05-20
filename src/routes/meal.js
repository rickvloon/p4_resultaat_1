const express = require('express');
const router = express.Router();

const mealController = require('../controllers/mealController');
const authController = require('../controllers/authController');

router.post('/', mealController.validateMeal, mealController.createMeal);

module.exports = router;
