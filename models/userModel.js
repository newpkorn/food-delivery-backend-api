import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: false },
    phoneNumber: { type: String, required: true, default: '0000000000' },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
    image: { type: String, required: false },
    cartData: { type: Object, default: {} },
    registerDate: { type: Date, default: Date.now },
    updateDate: { type: Date, default: Date.now },
  },
  { minimize: false }
);

// Middleware: updateDate when any change or update from the user
userSchema.pre('save', function (next) {
  if (!this.isNew) {
    // no update registerDate
    this.updateDate = Date.now();
  }
  next();
});

const userModel = mongoose.model('User', userSchema);
export default userModel;
