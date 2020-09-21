const express = require('express');
const { getUsers, getUser, createUser, deleteUser, updateUser } = require('../controllers/users');
const User = require('../models/User');

// Protect route and advanced results middleware
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({mergeParams: true});

router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(advancedResults(User), getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);
   
module.exports = router;