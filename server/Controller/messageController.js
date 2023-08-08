const expressAsyncHandler =require("express-async-handler")
const Message = require("../models/messageModel")
const User = require("../models/userModel")
const Chat = require("../models/chatModel")

const allMessages = expressAsyncHandler(async(req,res)=>{
    try{
        const messages = await Message.find({chat:req.params.chatId})
        .populate("sender","name email")
        .populate("reciver")
        .populate("chat")
        res.json(messages)
    }catch(err){
        res.status(400)
        throw new Error(error.message)

    }
})

const sendMessage = expressAsyncHandler(async (req, res) => {
    const { content, chatId } = req.body;
    console.log(chatId);
    if (!content || !chatId) {
      return res.sendStatus(400);
    }
  
    const newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };
  
    try {
      const message = await Message.create(newMessage);
  
      await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
  
      res.json(message);
    } catch (err) {
      res.status(400).json({ message: "chat not foundd" });
    }
  });
  
module.exports = {allMessages,sendMessage}