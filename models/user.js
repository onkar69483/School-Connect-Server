const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        unique: true,
    },
    age: {
        type: Number,
        required: [true, "Please enter your age"],
    },
    role: {
        type: String,
        enum: ["Student", "Teacher", "Intern"],
        required: true,
    },
    batch: {
        type: String,
        enum: ["morning", "afternoon", "Both"],
        required: function () {
            return this.role === "Student";
        },
    },
    phone: {
        type: String,
        required: [true, "Please enter your phone number"],
    },
    emergencyContact: {
        type: String,
    },
    address: {
        type: String,
        required: [true, "Please enter your address"],
    },
    avatar: {
        type: Buffer,
        public_id: String,
        url: String,
    },
    username: {
        type: String,
        required: [true, "Please enter a username"],
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
    },
});

// Hash password before saving user
// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) {
//         return next();
//     }

//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });

// // Check if password matches the hashed password
// userSchema.methods.correctPassword = async function (
//     candidatePassword,
//     userPassword
// ) {
//     return await bcrypt.compare(candidatePassword, userPassword);
// };

module.exports = mongoose.model("User", userSchema);
