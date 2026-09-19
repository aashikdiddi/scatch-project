require("dotenv").config();

const express = require("express");
const app = express();
const cookieparser = require("cookie-parser");
const path = require("path");

// MongoDB connection
console.log(
    "MONGODB_URI starts with:",
    process.env.MONGODB_URI
        ? process.env.MONGODB_URI.substring(0, 14)
        : "UNDEFINED"
);

require("./config/mongoose-connection");

const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");

const expressSession = require("express-session");
const flash = require("connect-flash");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());

app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET,
    })
);

app.use(flash());

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

// Home → Login page
app.get("/", function(req, res) {
    res.render("login");
});

app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
});