const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email or phone' 
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password,
      authMethod: 'email'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real app, you would send this OTP via SMS
    // For now, we'll just return it (remove this in production)
    console.log(`OTP for ${phone}: ${otp}`);

    // Store OTP in user's session or cache (implement as needed)
    // For now, we'll just return success

    res.json({
      message: 'OTP sent successfully',
      // Remove this in production
      otp: otp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // In a real app, you would verify the OTP from your SMS service
    // For now, we'll accept any 6-digit OTP
    if (!otp || otp.length !== 6) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check if user exists
    let user = await User.findOne({ phone });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        name: 'User', // You might want to get this from the request
        phone,
        authMethod: 'phone',
        isVerified: true
      });
      await user.save();
    } else {
      user.isVerified = true;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Google/Facebook login (placeholder)
router.post('/social-login', async (req, res) => {
  try {
    const { provider, token, userData } = req.body;

    // In a real app, you would verify the social token
    // For now, we'll just create/update the user

    let user = await User.findOne({ 
      $or: [
        { email: userData.email },
        { [`${provider}Id`]: userData.id }
      ]
    });

    if (!user) {
      user = new User({
        name: userData.name,
        email: userData.email,
        profilePicture: userData.picture,
        authMethod: provider,
        isVerified: true
      });
    } else {
      user.name = userData.name;
      user.profilePicture = userData.picture;
      user.isVerified = true;
    }

    await user.save();

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Social login successful',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
