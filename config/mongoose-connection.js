
const dns = require("dns");

dns.setServers(["8.8.8.8"]);

const mongoose = require("mongoose");

const dbgr = require("debug")("development:mongoose");

mongoose
    .connect(process.env.MONGODB_URI)
    .then(function () {
        dbgr("connected");
        console.log("MongoDB connected successfully");
    })
    .catch(function (err) {
        dbgr(err);
        console.log("MongoDB connection error:", err.message);
    });

module.exports = mongoose.connection;