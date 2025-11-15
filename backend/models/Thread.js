import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const threadSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  threadId: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    default: "New Chat",
  },
  message: {
    type: [messageSchema], // ✅ Corrected this
    default: [],            
  },
  created_At: {
    type: Date,
    default: Date.now,
  },
  updated_At: {
    type: Date,
    default: Date.now,
  },
});

threadSchema.index({ owner: 1, threadId: 1 }, { unique: true });

threadSchema.pre("save", function updateTimestamp(next) {
  this.updated_At = new Date();
  next();
});

export default mongoose.model("Thread", threadSchema);
