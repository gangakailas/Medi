import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: [3, "First Name should contain atleast 3 characters!"],
  },
  lastName: {
    type: String,
    required: true,
    minLength: [3, "Last Name should contain atleast 3 characters!"],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, "Please provide a valid Email!"],
  },
  phone: {
    type: String,
    required: true,
    minLength: [10, "Phone Number Must Contain Exactly 10 Digits!"],
    maxLength: [10, "Phone Number Must Contain Exactly 10 Digits!"],
  },
  message: {
    type: String,
    required: true,
    minLength: [10, "Message Should Contain Atleast 10 Characters"],
  },
});

export const Message = mongoose.model("Message", messageSchema);
