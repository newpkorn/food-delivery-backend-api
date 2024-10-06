import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cartData: { type: Object, default: {} },
  registerDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now }
}, { minimize: false });

// Middleware: updateDate when any change or update from the user
userSchema.pre('save', function (next) {
  if (!this.isNew) {  // no update registerDate
    this.updateDate = Date.now();
  }
  next();
});

const userModel = mongoose.model('User', userSchema);
export default userModel;
