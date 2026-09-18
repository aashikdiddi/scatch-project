const express = require("express");
const router = express.Router();

const ownermodel = require("../models/owners-models");
const productsModel = require("../models/products-model");
const ordersModel = require("../models/orders-model");


if(process.env.NODE_ENV === "development"){
    router.post("/create",async function(req,res){
    let owner = await ownermodel.find();
    if(owner.length > 0){
      return res
      .status(503)
      .send("you don't have permision to create new owner");
    }

    let {fullname, email, password} = req.body; 

    let createdOwner = await ownermodel.create({
       fullname,
        email,
        password,
  });

    res.status(201).send(createdOwner);
  });
}


router.get("/admin", async function(req, res) {
    try {
        let products = await productsModel.find();

        let success = req.flash("success");

        res.render("admin", {
            success,
            products
        });

    } catch (err) {
        res.send(err.message);
    }
});



router.get("/create-product", function(req, res) {

    let success = req.flash("success");

    res.render("createsproducts", { success });

});




router.get("/orders", async function (req, res) {

    try {

        let orders = await ordersModel
            .find()
            .populate("user")
            .populate("products.product")
            .sort({ orderDate: -1 });

        res.render("admin-orders", { orders });

    } catch (err) {

        console.log("ADMIN ORDERS ERROR:", err);

        res.send(err.message);

    }

});







// ================= UPDATE ORDER STATUS =================

router.post("/orders/status/:id", async function (req, res) {

    try {

        let { status } = req.body;

        // Sirf ye statuses allowed hain
        let allowedStatuses = [
            "Pending",
            "Processing",
            "Shipped",
            "Delivered"
        ];

        if (!allowedStatuses.includes(status)) {

            return res.status(400).send("Invalid order status");

        }

        await ordersModel.findByIdAndUpdate(
            req.params.id,
            {
                status: status
            }
        );

        res.redirect("/owners/orders");

    } catch (err) {

        console.log("UPDATE ORDER STATUS ERROR:", err);

        res.send(err.message);

    }

});







// ================= ADMIN DASHBOARD =================

router.get("/dashboard", async function (req, res) {

    try {

        // Total products
        let totalProducts = await productsModel.countDocuments();

        // Total orders
        let totalOrders = await ordersModel.countDocuments();

        // Pending orders
        let pendingOrders = await ordersModel.countDocuments({
            status: "Pending"
        });

        // Delivered orders
        let deliveredOrders = await ordersModel.countDocuments({
            status: "Delivered"
        });

        // Total sales
        let salesData = await ordersModel.aggregate([
            {
                $match: {
                    status: "Delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: {
                        $sum: "$totalAmount"
                    }
                }
            }
        ]);

        let totalSales = 0;

        if (salesData.length > 0) {
            totalSales = salesData[0].totalSales;
        }

        // Recent orders
        let recentOrders = await ordersModel
            .find()
            .populate("user")
            .sort({ orderDate: -1 })
            .limit(5);

        res.render("dashboard", {
            totalProducts,
            totalOrders,
            pendingOrders,
            deliveredOrders,
            totalSales,
            recentOrders
        });

    } catch (err) {

        console.log("DASHBOARD ERROR:", err);

        res.send(err.message);

    }

});



module.exports = router;