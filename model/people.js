import mongoose from "mongoose";

const peopleSchema= mongoose.Schema({
    name:{
        type:String,
        require:true,
        lowercase:true,
        trim: true
    },
    password:{
        type:String,
        require:true,
    },
    confirmpassword:{
        type:String,
        require:true,
    },
    domain:{
        type:String,
        require:true,
        lowercase: true
    },
    gender:{
        type:String,
        require:true,
    },
    gmail:{
        required:true,
       type:String,
        unique: true,
    }
})
const people=new mongoose.model("People",peopleSchema);
export default people;
const peopleprofileSchema=mongoose.Schema(
    {
        profilePic:String,
        groupName:String,
        bio:String,
        id:String
    }
)
export const peopleprofile=new  mongoose.model("PeopleProfile",peopleprofileSchema);
const postSchema=mongoose.Schema(
    {
        fileid:String,
        id:String,
        content:String,
        
    }
)
export const postprofile=new mongoose.model("Post",postSchema);

const chatModel= mongoose.Schema({
    chatName:{type: String, trim:true},
    isGroupChat:{type: Boolean, default: false},
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
    ],
    lastestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Message",
    },
    groupAdmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
},
    {
        timestamps:true,
    }
);
export const Chatbot=new mongoose.model("Chatbot",chatModel);
const messageModal= mongoose.Schema({
    message:{
     text:{
         type: String,
         required:true,
     },
    },
    users: Array,
    sender:{
     type: mongoose.Schema.Types.ObjectId,
     ref:"User",
     required:true,
    },
 },
 {
     timestamps: true,
 }
 );
 export const Message=mongoose.model("Message",messageModal);



