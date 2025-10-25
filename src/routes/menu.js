const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// Get menu items by restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category, search } = req.query;

    const query = { 
      restaurant: restaurantId,
      isActive: true,
      isAvailable: true
    };

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const menuItems = await MenuItem.find(query)
      .populate('restaurant', 'name cuisine')
      .sort({ category: 1, name: 1 });

    // Group by category
    const groupedMenu = menuItems.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    res.json({
      menu: groupedMenu,
      totalItems: menuItems.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get menu item by ID
router.get('/item/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('restaurant', 'name cuisine rating deliveryTime');

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get menu categories
router.get('/categories/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const categories = await MenuItem.distinct('category', {
      restaurant: restaurantId,
      isActive: true,
      isAvailable: true
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search menu items
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { restaurantId, limit = 20 } = req.query;

    const searchQuery = {
      $or: [
        { name: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') }
      ],
      isActive: true,
      isAvailable: true
    };

    if (restaurantId) {
      searchQuery.restaurant = restaurantId;
    }

    const menuItems = await MenuItem.find(searchQuery)
      .populate('restaurant', 'name cuisine rating')
      .limit(parseInt(limit))
      .sort({ rating: -1 });

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create menu item (admin only)
router.post('/', async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    
    const populatedItem = await MenuItem.findById(menuItem._id)
      .populate('restaurant', 'name cuisine');
    
    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update menu item
router.put('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('restaurant', 'name cuisine');

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete menu item
router.delete('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get popular menu items
router.get('/popular/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { limit = 10 } = req.query;

    const popularItems = await MenuItem.find({
      restaurant: restaurantId,
      isActive: true,
      isAvailable: true
    })
    .sort({ rating: -1, totalReviews: -1 })
    .limit(parseInt(limit))
    .populate('restaurant', 'name cuisine');

    res.json(popularItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
