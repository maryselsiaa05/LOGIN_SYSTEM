const express = require("express");
const userController = require('../controllers/users');
const router = express.Router();

router.post('/register',userController.register);
router.post('/recovery',userController.recovery);
router.post('/login',userController.login);
router.post('/two_step',userController.two_step);
router.get("/logout",userController.logout);
module.exports = router;