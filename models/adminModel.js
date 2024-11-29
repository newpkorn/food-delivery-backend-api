import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: {type: String, required: true},
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

adminSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);
export default adminModel;