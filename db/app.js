import mongoose from "mongoose";
const mongodb="mongodb+srv://gargeedas8061:uyLGVoUFOePmuLXv@cluster0.pdhoz7v.mongodb.net/Socialmedia?retryWrites=true&w=majority&appName=Cluster0";
export const mongoseeConnection = mongoose.connect(mongodb,(err)=>{
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


