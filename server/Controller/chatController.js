const asyncHandler = require('express-async-handler')
const Chat = require("../models/chatModel")
const User = require("../models/userModel")

const accessChat = asyncHandler(async (req,res)=>{
 const{ userId } = req.body
 if(!userId){
    console.log("userid param not sent with request")
    return res.sendStatus(400)
 }
 var isChat = await Chat.find({
    isGroupChat : false,
    $and:[
        {users:{$elemMatch:{$eq:req.user._id}}},
        {users:{$elemMatch:{$eq:userId}}}
    ]
 })
 .populate("users","-passwords")
 .populate("latestMessage","name email")
 isChat = await User.populate(isChat,{
    path:"latestMessage.sender",
    select:"name email"
 })
 if(isChat.length > 0){
    res.send(isChat[0])
 }else{
    var chatData ={
        chatName:"sender",
        isGroupChat:false,
        users:[req.user._id,userId]
    };
    try{
        const createdChat = await Chat.create(chatData)
        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
        res.status(200).json(FullChat)
    }
    catch(err){
        res.status(400)
        throw new Error(err.message)
    }

 }
}
)
const fetchChats = asyncHandler(async(req,res)=>{
try{
    await Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
    .populate("users","-password")
    .populate("groupAdmin","-password")
    .populate("latestMessage")
    .sort({updatedAt:-1})
    .then(async(results)=>{
        results = await User.populate(results,{
            path:"latestMessage.sender",
            select:"name email"
        })
        res.status(200).send(results)
    })
}catch(err){
    res.status(400)
    throw new Error(err.message)
}
})
const fetchGroups = asyncHandler(async (req,res)=>{
try{
    const allgroups = await Chat.where("isGroupChat").equals(true)
    res.status(200).send(allgroups)
}catch(err){
    res.status(400)
    throw new Error(err.message)
}
})
const createGroupChat = asyncHandler(async (req,res)=>{
    if(!req.body.users ||!req.body.name){
        return res.status(400).send({message:"data is insufficient"})
    }
    var users = JSON.parse(req.body.users)
    users.push(req.user)
    try{
        const groupChat = await Chat.create({
            chatName:req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin:req.user
        })
        const FullGroupChat = await Chat.findOne({_id:groupChat._id})
        .populate("users","-password")
        .populate("groupAdmin","-password")
      res.status(200).json(FullGroupChat)
    }catch(err){
        res.status(400)
        throw new Error(err.message)
    }
})

  
  
const groupExit = asyncHandler(async (req,res)=>{
   const{chatId,userId} =req.body
   //check if requester is admin
   try {
    // Find the chat by chatId and populate 'users' and 'groupAdmin' fields
    const chat = await Chat.findByIdAndUpdate(chatId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

   
   if(!chat){
    return res.status(404).json({message:"chat not found"})
   }
   //check if requstor is admin
   if(chat.groupAdmin.toString()!== req.user._id.toString()){
    return res.status(401).json({message:"only admins can remove group members!"})
   }
   const userIndex = chat.users.findIndex((user)=>{
    user._id.toString()=== userId
   })
   if(userIndex === -1){
    return res.status(404).json({message:"user not found"})
   }
   chat.users.splice(userIndex,1)
   await chat.save()
   res.status(200).json(chat)
}catch(err){
res.status(500).json({message:"Internal server ERROR"})
}
}
)
const addSelftoGroup = asyncHandler(async(req,res)=>{
    const{chatId,userId} = req.body
   try{ const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push :{users:userId}
        },
        {new : true}

    )
    .populate("users","-password")
    .populate("groupAdmin","-password")
    res.status(200).json(added)
}
catch(err){
    res.status(500).json({message:"internal server error"})
}
if(!added){
    return res.status(400).json({message: "group not found"})
}

}
)
module.exports ={
    accessChat,
    fetchChats,
    fetchGroups,
    createGroupChat,
    groupExit,
    addSelftoGroup
}