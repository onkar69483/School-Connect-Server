const mongoose = require("mongoose");

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
});

module.exports = mongoose.model("User", userSchema);
