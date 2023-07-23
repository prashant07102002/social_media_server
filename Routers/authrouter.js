const router = require("express").Router();
const authcontroller = require('../Controllers/authController');
const requiretoken = require("../middlewares/requiretoken");

router.post('/signup', authcontroller.signupController);
router.post('/login', authcontroller.loginController);
router.get('/refresh', authcontroller.generateAccessTokenController);
router.post('/logout', authcontroller.logoutController);
module.exports = router;