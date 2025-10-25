const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add address
router.post('/:userId/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.addresses.push(req.body);
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update address
router.put('/:userId/addresses/:addressId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    Object.assign(address, req.body);
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete address
router.delete('/:userId/addresses/:addressId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.addresses.id(req.params.addressId).remove();
    await user.save();

    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add payment method
router.post('/:userId/payment-methods', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.paymentMethods.push(req.body);
    await user.save();

    res.json(user.paymentMethods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete payment method
router.delete('/:userId/payment-methods/:methodId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.paymentMethods.id(req.params.methodId).remove();
    await user.save();

    res.json(user.paymentMethods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
