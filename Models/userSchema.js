const mongoose=require('mongoose');


const userSchema= new mongoose.Mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true,
    },
    email:{
        type:String,
        unique:true
    },
    mobile:{
        type:String,
        required:true,
        unique:true
    },
    address:{
        type:String,
        required:true
    },
    adhaarCardNumber:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["voter","admin"],
        default:"voter"
    },
    isVoted:{
        type:Boolean,
        default:false
    }
})

const User= mongoose.model("User",userSchema);

module.exports = User;