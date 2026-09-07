const express = require("express");
const app = express();
const cookieparser = require("cookie-parser");
const path = require("path");
const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");



const db = require("./config/mongoose-connection");


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieparser());
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs");


app.get("/owners",ownersRouter);
app.get("/users",usersRouter);
app.get("/products",productsRouter);


app.listen(3000);

