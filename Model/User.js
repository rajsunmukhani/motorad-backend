const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    email : {
        type : String,
        unique : true,
        required : true,
        match : [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password : {
        type : String,
        select : false,
        minLength : [6, 'Password Length should contain at least 6 characters'],
        maxLength : [15, 'Password Length should not be more than 15 characters'],
    },
    username : {
        type : String,
        required : [true, 'First Name is required!'],
        minLength : [2, 'First name should have at least 2 characters'],
        maxLength : [10, 'First name should have at most 10 characters']
    },
    avatar : {
        type : Object,
        default : {
            fileID : '',
            url : 'https://t3.ftcdn.net/jpg/05/87/76/66/360_F_587766653_PkBNyGx7mQh9l1XXPtCAq1lBgOsLl6xH.jpg'
        }
    },
    googleId: {
        type: String, 
        unique: true,
        sparse: true 
    },
    displayName: {
        type: String // New field to store user's display name from Google
    },
}, { timestamps: true });

userSchema.pre('save', function() {
    if (!this.isModified('password')) {
        return;
    };
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
});

userSchema.methods.comparePasswords = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.genToken = function() {
    const token = jwt.sign(
    {
      id: this._id,
      name: this.username, // Assuming username is the name you want to display
      avatar: this.avatar, // Ensure avatar is part of your User model
    },
    process.env.JWT_SECRET, // Your secret key for signing tokens
    { expiresIn: '1d' }
  );
  return token;
};

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
