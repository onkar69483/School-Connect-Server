import mongoose, { Document } from "mongoose";

interface IUser extends Document {
    name: string;
    age: number;
    role: string;
    batch?: string;
    phone: string;
    emergencyContact?: string;
    address: string;
    avatar: Buffer;
}

const userSchema = new mongoose.Schema<IUser>({
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
        required: function (this: IUser) {
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
    avatar : {
        type: 'Buffer',
        public_id: String,
        url: String, 
    }
});

export default mongoose.model<IUser>("User", userSchema);
