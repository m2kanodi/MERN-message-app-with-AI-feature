const mongoose = require('mongoose')
const MessageModel = mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
       },
    reciver: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
       },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat"
    }   

},{
   timeStamp: true, 
})
const Message = mongoose.model("Message",MessageModel)
module.exports = Message