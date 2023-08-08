
const express = require("express")
const dotenv = require("dotenv")
const { default: mongoose } = require("mongoose")
const userRoutes = require("./Routes/userRoutes")
const chatRoutes = require("./Routes/chatRoute")
const messageRoutes = require("./Routes/messageRoutes")
const app = express()

dotenv.config()
app.use(express.json())
const connectdb =async()=>{
try{const connect =mongoose.connect(process.env.MONGO_URL)
    console.log("Server is connected to db")
}  catch(err) {
    console.log(err)
}

}
connectdb()

app.use("/user",userRoutes)
app.use("/chat",chatRoutes)
app.use("/message",messageRoutes)
const PORT = process.env.PORT
app.listen(PORT,console.log("server is running"))
