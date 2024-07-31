import mongoose from "mongoose";

const usermodel= mongoose.Schema({
    adminid:{
        type:String,
       
    },
    oriid:{
        type:String,
        
    },
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
    },
    pic: {
        type:String,
        require:true,
        default:
            "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
},
{
    timestamps: true
})
export const User=new mongoose.model("User",usermodel);