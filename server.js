const express=require('express');


const app=express();

const bodyPareser=require('body-parser');

app.use(bodyPareser.json());



const PORT=process.env.PORT || 5000
app.get('/',(req,res)=>{
    res.send('Hi chlo shuru kro ')
})

const userRoutes= require('./Routes/userRoutes')

app.use('/user',userRoutes);



app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})