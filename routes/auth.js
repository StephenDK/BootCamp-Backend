const express = require('express');

const { register, login, getMe, ForgotPassword } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', ForgotPassword);




module.exports = router;