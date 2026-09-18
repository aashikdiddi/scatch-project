
const express = require("express");
const router = express.Router();

const productsModel = require("../models/products-model");
const ordersModel = require("../models/orders-model");
const isloggedin = require("../middleware/isloggedin");

const {
    registerUser,
    loginUser,
    logout
} = require("../controllers/authcontroller");


// ===============================
// USERS HOME
// ===============================

router.get("/", function (req, res) {
    res.send("Users router working");
});


// ===============================
// LOGIN PAGE
// 

router.get("/login", function (req, res) {
    res.render("login");
});


// ===============================
// REGISTER
// ===============================

router.get("/register", function (req, res) {
    res.render("register");
});


router.post("/register", registerUser);


// ===============================
// LOGIN
// ===============================

router.post("/login", loginUser);


// ===============================
// LOGOUT
// ===============================

router.get("/logout", logout);


// ===============================
// SHOP
// ===============================

router.get("/shop", async function (req, res) {

    try {

        let products = await productsModel.find();

        res.render("shop", {
            products
        });

    } catch (err) {

        res.send(err.message);

    }

});


// ===============================
// CART
// ===============================

router.get("/cart", isloggedin, async function (req, res) {

    try {

        let user = req.user;

        await user.populate("card.product");

        res.render("cart", {
            products: user.card
        });

    } catch (err) {

        console.log("CART ERROR:", err);

        res.send(err.message);

    }

});


// ===============================
// ADD TO CART
// ===============================

router.get("/addtocart/:id", isloggedin, async function(req, res) {
    try {
        let user = req.user;

        let product = await productsModel.findById(req.params.id);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        // Check karo product pehle se cart mein hai ya nahi
        let existingItem = user.card.find(function(item) {
            return item.product.toString() === product._id.toString();
        });

        if (existingItem) {
            // Already hai to quantity +1
            existingItem.quantity += 1;
        } else {
            // Nahi hai to new item add karo
            user.card.push({
                product: product._id,
                quantity: 1
            });
        }

        await user.save();

        res.redirect("/users/cart");

    } catch (err) {
        console.log("ADD TO CART ERROR:", err);
        res.send(err.message);
    }
});



router.get("/removefromcart/:id", isloggedin, async function(req, res) {
    try {
        let user = req.user;

        user.card = user.card.filter(function(productId) {
            return productId.toString() !== req.params.id;
        });

        await user.save();

        res.redirect("/users/cart");

    } catch (err) {
        console.log("REMOVE FROM CART ERROR:", err);
        res.send(err.message);
    }
});






// Increase quantity
router.get("/increasequantity/:id", isloggedin, async function(req, res) {
    try {
        let user = req.user;

        let item = user.card.find(function(item) {
            return item.product.toString() === req.params.id;
        });

        if (!item) {
            return res.status(404).send("Product not found in cart");
        }

        item.quantity += 1;

        await user.save();

        res.redirect("/users/cart");

    } catch (err) {
        console.log("INCREASE QUANTITY ERROR:", err);
        res.send(err.message);
    }
});


// Decrease quantity
router.get("/decreasequantity/:id", isloggedin, async function(req, res) {
    try {
        let user = req.user;

        let item = user.card.find(function(item) {
            return item.product.toString() === req.params.id;
        });

        if (!item) {
            return res.status(404).send("Product not found in cart");
        }

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            user.card = user.card.filter(function(item) {
                return item.product.toString() !== req.params.id;
            });
        }

        await user.save();

        res.redirect("/users/cart");

    } catch (err) {
        console.log("DECREASE QUANTITY ERROR:", err);
        res.send(err.message);
    }
});






router.get("/placeorder", isloggedin, async function(req, res) {
    try {

        let user = req.user;

        // Cart ko product ke saath populate karo
        await user.populate("card.product");

        if (user.card.length === 0) {
            return res.send("Your cart is empty");
        }

        // Total calculate karo
        let totalAmount = user.card.reduce(function(total, item) {
            return total +
                (Number(item.product.price) * Number(item.quantity));
        }, 0);

        // Order create karo
        let order = await ordersModel.create({
            user: user._id,

            products: user.card.map(function(item) {
                return {
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price
                };
            }),

            totalAmount: totalAmount,
            status: "Pending"
        });

        // Order banne ke baad cart empty
        user.card = [];

        await user.save();

        res.redirect("/users/order-success");

    } catch (err) {

        console.log("PLACE ORDER ERROR:", err);

        res.send(err.message);
    }
});




router.get("/order-success", isloggedin, function(req, res) {
    res.render("order-success");
});






router.get("/orders", isloggedin, async function(req, res) {
    try {

        let user = req.user;

        let orders = await ordersModel
            .find({ user: user._id })
            .populate("products.product")
            .sort({ orderDate: -1 });

        res.render("orders", { orders });

    } catch (err) {

        console.log("ORDERS ERROR:", err);

        res.send(err.message);
    }
});


module.exports = router;