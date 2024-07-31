import mongoose from "mongoose";
const mongodb="mongodb://127.0.0.1:27017/Socialmedia";
mongoose.connect(mongodb,(err)=>{
    if(err){
        console.log("unnable connection");
    }else{
        console.log('mongoDB connected');
    }
});
export const conn=mongoose.connection;
conn.on('error', console.error.bind(console, "Error connecting to db"));

conn.once('open', function(){
    console.log("connected to DB"); 
})


