const express = require('express')
const{
    allMessages,
    sendMessage
} = require("../Controller/messageController")
const{protect} = require("../middleware/authMiddleware")
const router = express.Router()
router.get("/:chatId",protect,allMessages)
router.post("/",protect,sendMessage)
module.exports = router