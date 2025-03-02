const mongoose=require('mongoose');
require('dotenv').config();


const mongoURL= process.env.mongoURL;


mongoose.connect(mongoURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const db= mongoose.connection;

db.on('connected',()=>{
    console.log('Connected to Local mongoDB');
})

db.on('error',(error)=>{
    console.log('MongoDB connection error',error);
})

db.on('disconnected',()=>{
    console.log('MongoDB is disconnected');
})

module.exports=db;