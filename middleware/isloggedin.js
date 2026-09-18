const jwt = require("jsonwebtoken");
const userModel = require("../models/users-model");

module.exports = async function(req, res, next) {

    console.log("🔥 MIDDLEWARE HIT");

    if (!req.cookies.token) {

        req.flash("error", "Please login first");

        return res.redirect("/");

    }

    try {

        let decoded = jwt.verify(
            req.cookies.token,
            process.env.JWT_KEY
        );

        console.log("DECODED USER:", decoded);

        let user = await userModel
            .findOne({ email: decoded.email })
            .select("-password");

        if (!user) {

            req.flash("error", "User not found");

            return res.redirect("/");

        }

        req.user = user;

        console.log("LOGGED IN USER:", user.email);

        next();

    } catch (err) {

        console.log("ISLOGGEDIN ERROR:", err);

        req.flash("error", "Something went wrong");

        return res.redirect("/");

    }

};