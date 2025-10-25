const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.authMethod === 'email';
    }
  },
  authMethod: {
    type: String,
    enum: ['email', 'google', 'facebook', 'phone'],
    default: 'email'
  },
  profilePicture: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  addresses: [{
    label: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'upi', 'wallet', 'cod'],
      required: true
    },
    lastFour: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  preferences: {
    cuisine: [String],
    dietaryRestrictions: [String],
    notifications: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      deliveryUpdates: { type: Boolean, default: true }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
