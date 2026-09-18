const usersModel = require("../models/users-model");
const bcrypt = require("bcrypt");
const { generatetoken } = require("../utils/jeneratetoken");


// ================= REGISTER USER =================

module.exports.registerUser = async function (req, res) {

    try {

        let { email, password, fullname } = req.body;

        let user = await usersModel.findOne({ email: email });

        if (user) {
            return res
                .status(401)
                .send("you already have an account. please login");
        }

        bcrypt.genSalt(10, function (err, salt) {

            bcrypt.hash(password, salt, async function (err, hash) {

                if (err) {
                    return res.send(err.message);
                }

                let user = await usersModel.create({

                    email,
                    password: hash,
                    fullname

                });

                let token = generatetoken(user);

                res.cookie("token", token);

                res.send("user created successfully");

            });

        });

    } catch (err) {

        res.send(err.message);

    }

};


// ================= LOGIN USER =================

module.exports.loginUser = async function (req, res) {

    let { email, password } = req.body;

    let user = await usersModel.findOne({
        email: email
    });

    if (!user) {

        return res.send("email or password incorrect");

    }

    bcrypt.compare(
        password,
        user.password,
        function (err, result) {

            if (result) {

                let token = generatetoken(user);

                res.cookie("token", token);

                // Login ke baad direct Shop page
                res.redirect("/users/shop");

            } else {

                res.send("email or password incorrect");

            }

        }
    );

};


// ================= LOGOUT USER =================

module.exports.logout = function (req, res) {

    res.cookie("token", "");

    res.redirect("/");

};