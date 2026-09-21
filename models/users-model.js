const mongoose = require("mongoose");


const userSchema = mongoose.Schema({
    fullname:{
       type: String,
       length:3,
       trim:true,
    },
    email:String,
    password:String,
    card: [
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
        },
        quantity: {
            type: Number,
            default: 1,
        }
    }
],
    orders:{
        type:Array,
        default:[],
    },
    contact:Number,
    picture:String,

});




module.exports = mongoose.model("user",userSchema);


