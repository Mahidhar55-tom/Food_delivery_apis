const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      cuisine, 
      rating, 
      deliveryTime,
      search,
      lat,
      lng,
      radius = 10
    } = req.query;

    const query = { isActive: true };

    // Add filters
    if (cuisine) query.cuisine = new RegExp(cuisine, 'i');
    if (rating) query.rating = { $gte: parseFloat(rating) };
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { cuisine: new RegExp(search, 'i') }
      ];
    }

    // Location-based filtering (simplified)
    if (lat && lng) {
      // In a real app, you would use proper geospatial queries
      // For now, we'll just return all restaurants
    }

    const restaurants = await Restaurant.find(query)
      .populate('owner', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, createdAt: -1 });

    const total = await Restaurant.countDocuments(query);

    res.json({
      restaurants,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get restaurants by cuisine
router.get('/cuisine/:cuisine', async (req, res) => {
  try {
    const { cuisine } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const restaurants = await Restaurant.find({ 
      cuisine: new RegExp(cuisine, 'i'),
      isActive: true 
    })
    .populate('owner', 'name email phone')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ rating: -1 });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search restaurants
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const restaurants = await Restaurant.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { cuisine: new RegExp(query, 'i') }
      ],
      isActive: true
    })
    .populate('owner', 'name email phone')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ rating: -1 });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby restaurants (simplified)
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 10, limit = 20 } = req.query;

    // In a real app, you would use proper geospatial queries
    // For now, we'll return all restaurants
    const restaurants = await Restaurant.find({ isActive: true })
      .populate('owner', 'name email phone')
      .limit(parseInt(limit))
      .sort({ rating: -1 });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create restaurant (admin only)
router.post('/', async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update restaurant
router.put('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete restaurant
router.delete('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
