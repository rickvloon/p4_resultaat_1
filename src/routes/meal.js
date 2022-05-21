const express = require('express');
const router = express.Router();

const mealController = require('../controllers/mealController');
const authController = require('../controllers/authController');

router.get('/', mealController.getAllMeals);

router.get('/:id', mealController.getMeal);

router.post('/', mealController.validateMeal, authController.validateToken, mealController.createMeal);

router.put('/:id', mealController.validateUpdatedMeal, authController.validateToken, mealController.updateMeal, mealController.getMeal);

router.delete('/:id', authController.validateToken, mealController.deleteMeal);

module.exports = router;
