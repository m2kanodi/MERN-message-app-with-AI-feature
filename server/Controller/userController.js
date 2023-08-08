const express = require('express')
const UserModel = require('../models/userModel')
const expressAsyncHandler = require('express-async-handler')
const generateToken = require("../Config/generateToken")
const loginController = expressAsyncHandler(async (req,res)=>{
  const {name,password} = req.body
  const user = await UserModel.findOne({name})
  console.log(user)
  if (!user) {
    throw new Error("User not found");
  }
  console.log(`Entered Password: ${password}`);
  console.log(`User's Hashed Password: ${user.password}`);
  console.log(`${await user.matchPassword(password)}`)
  if(user && (await user.matchPassword(password))){
    res.json({
      _id:user._id,
      name:user.name,
      email:user.email,
      isAdmin:user.isAdmin,
      token:generateToken(user._id)
    })
  }
  else{
    throw new Error("Invalid username or password")
  }
})
 const registerController = expressAsyncHandler (async(req,res)=>{
   const{name,email,password} = req.body;
   //check for all fields
   if(!name || !email || !password){
    res.status(400)
    throw Error("All necessary input fields not been filled")
   }
  // pre-existing user
  let existinguser;
  existinguser = await UserModel.findOne({email})
  if(existinguser){
    throw new Error("User Already Exist")
  }
  //userName already taken
  let userNameExist;
  userNameExist = await UserModel.findOne({name})
  if(userNameExist){
    throw new Error("Username already exist try something else")
  }
  //create an entry in the db
  const user = await UserModel.create({name,email,password})
  if(user){
    res.status(201).json({
      _id : user._id,
      name:user.name,
      email:user.email,
      isAdmin : user.isAdmin,
      token:generateToken(user._id)
    })
  }
  else{
    res.status(400)
    throw new Error("Registration Error")
  }  
    
  }
   
)
const fetchAllUsersController = expressAsyncHandler(async(req,res) =>{
  const keyword =req.query.search
  ?{
    $or:[
      {name:{$regex : req.query.search,$options :"i"}},
      {email:{$regex :req.query.search,$options:"i"}},
    ],
  }
  :{};
const users = await UserModel.find(keyword).find({
  _id:{$ne:req.user._id}
}) 
res.send(users) 
})
module.exports = {registerController,loginController,fetchAllUsersController}