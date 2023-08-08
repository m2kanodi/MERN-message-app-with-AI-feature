const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const userModel = mongoose.Schema({
    name : {type: String,
            required: true},
    email: {type: String,
        required: true},
   password:{type: String,
    required: true}           
},
{
    timestamps:true
})
userModel.methods.matchPassword = async function (enteredPassword) {
    console.log("Entered Password:", enteredPassword);
    console.log("User's Hashed Password:", this.password);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log("Password Match:", isMatch);
    return isMatch;
  };
  userModel.pre("save", async function (next) {
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
})

const User = mongoose.model("User",userModel)
module.exports = User