const express = require("express");
const router = express.Router();
const userController = require('../controllers/users');

router.get(["/","/login"],(req,res)=>{
    res.render("index");
});

router.get("/two_step",userController.isLoggedIn,(req,res)=>{
    res.render("two_step");
})

router.get("/register",(req,res)=>{
    res.render("register");
});

router.get("/recovery",(req,res)=>{
    res.render("recovery");
});

router.get("/profile",userController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.render("profile",{user:req.user});
    }else{
        res.redirect("/login");
    }
});

router.get("/home",userController.isLoggedIn,(req,res)=>{
    // console.log(req.name);
    if(req.user){
        res.render("home",{user:req.user});
    }else{
        res.redirect("/login");
    }
});

module.exports = router;