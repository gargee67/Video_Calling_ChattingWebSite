import express from "express";
import mongoose from "mongoose";
import {conn} from "./db/app.js";
import people from "./model/people.js";
import cors from "cors";
import bodyparser from 'body-parser';
import { peopleprofile } from "./model/people.js";
import multer from "multer";
import   { GridFsStorage }  from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import methodoverride from "method-override";
import pkg from "body-parser";
import fs from "fs";
import mongodb from "mongodb";
import MongoClient from "mongodb";
import path from "path";
import { fileURLToPath } from 'url';
import {postprofile} from "./model/people.js";
import { waitForDebugger } from "inspector";
import { User } from "./model/user.js";
import asyncHandler from "express-async-handler";
import { Chatbot } from "./model/people.js";
import { Message } from "./model/people.js";
import  {Server}  from "socket.io";


const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const app=express();
app.use(express.json());
app.use(cors());
app.use(methodoverride('_method'));
app.use('/images', express.static(path.join(__dirname, 'images')));


let gfs;
let gridFSBucket;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);  
  //gfs.collection('uploads');
  gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });

  //gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

const storage = new GridFsStorage({
    url: "mongodb://127.0.0.1:27017/Socialmedia",
    //content:(req,res)=>{console}
    file: (req, file) => {
      return new Promise((resolve, reject) => {
          const filename = file.originalname;
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };

            //console.log(fileInfo);
                resolve(fileInfo);
            
          
      });
    }
  });
       
  
const upload = multer({ storage});
app.use(bodyparser.json({ limit: '50mb' }))
app.use(bodyparser.urlencoded({ limit: '50mb', extended: true }))

app.post("/register",async(req,res)=>{
   // console.log(req.body);
    people.findOne({gmail:req.body.gmail},async(err,us)=>{
        if(us)
        {
            res.send({message:"Email id is already exits"});
        }
        else{
            const user = new people({
                name:req.body.name,
                password:req.body.password,
                confirmpassword:req.body.confirmpassword,
                domain:req.body.domain,
                gender:req.body.gender,
                gmail:req.body.gmail
            })    
            const createuser= await user.save();
            res.json(createuser);
        }   
    })
   
})
app.post('/upload', upload.single('file'), async(req, res) => {
   
  const check=await gfs.files.findOne({_id:req.file.id});
   const createpost= new postprofile({
        fileid:check._id.toHexString(),
        id:req.body.id,
        content:req.body.content,
        
   })
   const postsave=await createpost.save();
     res.json({ file: postsave  });
    //res.redirect('/');
  });
  app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'No files exist'
        });
      }
  
      // Files exist
      return res.json(files);
    });
  });
  app.get('/uploads/:_id',async(req,res)=>{
    //console.log("jkj",req.params._id);
    const check= await postprofile.findOne({fileid:req.params._id})
    if(check)
    {
      res.json(check)
    }
  })
  app.get('/image/:filename', (req, res) => {
    //console.log("bal");
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gridFSBucket.openDownloadStream(file._id);
        readstream.pipe(res);
      }else {
        readstream.on("error", function (err) {
            res.send("Image not found");
          });
        }
      
      
    })
  });
  app.get('/profile/bio/:id',async(req,res)=>{
    const id=req.params.id;
    const check=await peopleprofile.findOne({id:id})
    if(check)
    {
      res.json(check);
    }
  })
  app.get('/profile/:id', async(req, res) => {
    var postt=0;
    const id1=req.params.id;
    //console.log("hkhk",id1);
    const check=await postprofile.find({id:id1});
    //console.log("j",check);
    if(check)
    {
      //const photocheck=await gfs.files.findOne({id:check.fileid})
      const m=check.fileid;
      const checkfileid=[];
      check.forEach(ids => {
        checkfileid.push(ids.fileid);
      })
      //console.log("k",checkfileid);
      //var id=new mongoose.Types.ObjectId(m);
       await gfs.files.find().toArray((err, files) => {
          postt=files.length;
          // Check if files
          if (!files || files.length === 0) {
            res.send({message:"Create Your Post"})
          } else {
            files.map(file => {
              
              
              if (
                file.contentType === 'image/jpeg' ||
                file.contentType === 'image/png'
              ) {
                if(checkfileid.includes(file._id.toHexString())){

                  file.isImage = true;
                }else{
                  
                  file.isImage = false;
                }
                
              } else {
                file.isImage = false;
              }
            
            });
           res.json({
            files:files,
            post:postt
           });
          }
        });
      }
    
    
  });
  
app.post("/login",async(req,res)=>{
    var password=req.body.password;
    const check=await people.findOne({password:password})
        if(check)
        {
            //console.log(check.gmail);
            //console.log(req.body.email);
            if(check.gmail==req.body.gmail)
            {
                res.json(check);
            }else{
                res.send({message:"User Not Found"});
            }
        }else{
            res.send({message:"User Not Found"});
        }
})
app.patch("/profile/:id", async(req, res) => {
    //ExpenseAndAmountTemplate.findByIdAndRemove(request.params.id, function(err){
    //console.log("hih",req.params.id);
    const check=await peopleprofile.findOne({id:req.params.id});
    //console.log(check);
    if(check)
    {
        try{
            const userprofile12=await peopleprofile.updateOne({id:req.params.id},{
                $set: {
                    profilePic:req.body.profilePic,
                    groupName:req.body.groupName,
                    bio:req.body.bio,                       
                }
            })
            const take=await peopleprofile.findOne({id:req.params.id});
           res.json(take);
        }catch(err){
            res.json({status: "no", data: "noupdate"})
        }
    }else{
        const userprofile = new peopleprofile({
            profilePic:req.body.profilePic,
            groupName:req.body.groupName,
            bio:req.body.bio,    
            id:req.params.id
        })    
        const createuser2= await userprofile.save();
        res.json(createuser2);
    }
    //const newImage = await peopleprofile.create(body);
    //console.log(newImage);
    
     });
     app.get("/profile/:id",(req,res)=>{
        //console.log(req.params.id);
        peopleprofile.find({id: req.params.id})
        .then(user4=>res.json(user4))
        .catch(err=>res.json(err))
    })

    app.get("/search/:domain",(req,res)=>{
      //console.log(req.params.domain);

      people.find({domain: req.params.domain})
      .then(user9=>res.json(user9))
      .catch(err=>res.json(err))
    })

    app.post("/user/:id/:_id",upload.any(),async(req,res)=>{
      const check=await User.find({adminid:req.params._id,oriid:req.params.id})
      //console.log(check)
          if(check.length==0)
          {
              const user=User({
                adminid:req.params._id,
                oriid:req.params.id,
                name:req.body.name,
                email:req.body.gmail,
                pic:req.body.pic
              })
              const createuser= await user.save();
              res.send({message:"ok"})
          }else{
            res.send({message:"You already follow"});
          }
  })
  app.get("/user/:id/:_id",async(req,res)=>{
    //console.log(req.params._id);
    const check=await User.find({adminid:req.params._id,oriid:req.params.id})
    //console.log(check.length);
        if(check.length!=0)
        {
            res.send({message:"ok"})
        }else{
          res.send({message:"no"});
        }
})
app.get("/user/:_id",async(req,res)=>{
 //console.log("hi",req.params._id);
  const check=await User.find({adminid:req.params._id}).exec(function (err, results) {
    var count = results.length
    res.send({count:count})
  });
  
  
})
app.get("/follower/:id",async(req,res)=>{
  //console.log("hi",req.params.id);
  const check=await User.find({oriid:req.params.id}).exec(function (err, results) {
    var count = results.length
    res.send({count:count})
  });
  
  
})
app.delete("/user/:id",async(req,res)=>{
  //console.log("jijij");
  try{
  const deletestudent= await User.deleteOne({oriid:req.params.id});
  if(! deletestudent){
      res.status(400).send();
  }else{
      res.send(deletestudent);
  }
}catch(e){
  res.status(500).send(e);
}
})
app.post("/user/message",upload.any(),async(req,res)=>{
  //console.log(req.body);
  try{
    const {from, to, message}=req.body;
    const data=await Message.create({
      message:{text: message},
      users:[from, to],
      sender: from,
    });
    if(data) {return res.json(data)}else{
      return res.json({msg: "failed to add message to database"})
    }
  
  }catch(err)
  {
    res.send(err);
  }
})
app.post("/user1/message",upload.any(),async(req,res)=>{
  //console.log(req.body);
  try{
    const {from, to}=req.body;
    const message=await Message.find({
      users:{
        $all:[from,to],
      },
    })
    .sort({updateAt:1});
    const projectMessage= message.map((msg)=>{
      return{
        fromSelf:msg.sender.toString()===from,
        message:msg.message.text,
      };
    });
    res.json(projectMessage);
  }catch(err)
  {
    res.send(err);
  }
})
app.get("/user1/:_id",async(req,res)=>{
  //console.log("hi",req.params._id);
   const check=await User.find({adminid:req.params._id})
   if(check)
   {
    res.json(check)
   }else{
    res.status(400)
   }
   
   
 })

const server=app.listen(8000,()=>{
    console.log("your server is started ai 8000");
})
const io=new Server(server,{
  cors: {
    origin:"http://localhost:3000",
    credentials: true,
  },
});
global.onlineUsers=new Map();
io.on("connection",(Server)=>{
  global.chatSocket= Server;
  Server.on("add-user",(userId)=>{
    onlineUsers.set(userId,Server.id);
  });

  Server.on("send-msg",(data)=>{
    
    const sendUserSocket=onlineUsers.get(data.to);
    if(sendUserSocket){
      console.log("hkhk",data.message);
     Server.to(sendUserSocket).emit("msg-recieve",data.message);
    }
  });
  Server.emit('me',Server.id);
  Server.on('disconnect',()=>{
    Server.broadcast.emit("callEnded");
  })
  Server.on("callUser",({userToCall,signalData,from,name})=>{
    //console.log("nidnc",{userToCall,signalData,from,name}),
    io.to(userToCall).emit("callUser",{signal:signalData,from,name});
  });
  Server.on("answercall",(data)=>{
    console.log("nidnc",data),
    io.to(data.to).emit("callAccepted",data.signal);
  })
}); 
