const express = require("express");
const router = express.Router();
const isloggendin = require("../middleware/isloggedin");
const productsModel = require("./models/products-model");
const userModel = require("./models/users-model");

router.get("/",function(req,res){
    let error = req.flash("error");
    res.render("index",{error,loggedin:false});
});

router.get("/shop",isloggendin, async function(req,res){
    let products = await productsModel.find();
    let success = req.flash("success");
    res.render("shop",{products,success});
});


router.get("/cart",isloggendin, async function(req,res){
    let user = await userModel.findOne({email:req,user,email})
    .populate("cart");
      
    res.render("cart",{ user });
});


router.get("/addtocart/:productid",isloggendin, async function(req,res){
    let user = await userModel.findOne({email:req.user.email});
    user.cart.push(req.params.productid);
    await user.save();
    req.flash("success","added to cart");
    res.redirect("/shop");
});




router.get("/logout",function(req,res){
    res.render("shop");
});

module.exports = router;