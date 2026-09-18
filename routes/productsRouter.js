const express = require("express");
const router = express.Router();
const productsModel = require("../models/products-model");
const upload = require("../config/multer-config");



router.post("/create",upload.single("image"), async function(req,res){
try{let { name,price,discount, bgcolor,panelcolor,textcolor,} = req.body;
      
   let product = await productsModel.create({
    image:req.file.buffer,
    name,
    price,
    discount,
    bgcolor,
    panelcolor,
    textcolor,
  });
  
  req.flash("suceess","product created sucessfully");
  res.redirect("/owners/admin");
} catch(err){
     res.send(err.message);
  }
});

router.get("/image/:id", async function(req, res) {
    try {
        let product = await productsModel.findById(req.params.id);

        if (!product || !product.image) {
            return res.status(404).send("Image not found");
        }

        res.set("Content-Type", "image/jpeg");
        res.send(product.image);

    } catch (err) {
        res.status(500).send(err.message);
    }
});




router.post("/delete/:id", async function(req, res) {
    try {

        await productsModel.findByIdAndDelete(req.params.id);

        req.flash("success", "Product deleted successfully");

        res.redirect("/owners/admin");

    } catch (err) {

        res.send(err.message);

    }
});


router.get("/edit/:id", async function(req, res) {
    try {

        let product = await productsModel.findById(req.params.id);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        res.render("edit-product", {
            product
        });

    } catch (err) {

        res.send(err.message);

    }
});


router.post("/update/:id", upload.single("image"), async function(req, res) {
    try {

        let {
            name,
            price,
            discount,
            bgcolor,
            panelcolor,
            textcolor
        } = req.body;

        let product = await productsModel.findById(req.params.id);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        product.name = name;
        product.price = price;
        product.discount = discount;
        product.bgcolor = bgcolor;
        product.panelcolor = panelcolor;
        product.textcolor = textcolor;

        // Agar new image select ki hai tabhi image update hogi
        if (req.file) {
            product.image = req.file.buffer;
        }

        await product.save();

        req.flash("success", "Product updated successfully");

        res.redirect("/owners/admin");

    } catch (err) {

        res.send(err.message);

    }
});






module.exports = router;