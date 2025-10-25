const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Get user's orders
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const query = { customer: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('restaurant', 'name cuisine rating')
      .populate('items.menuItem', 'name price images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderId })
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name cuisine rating deliveryTime')
      .populate('items.menuItem', 'name price images')
      .populate('deliveryAgent', 'name phone');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { customer, restaurant, items, deliveryAddress, paymentMethod, promoCode } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.menuItem} not found` });
      }

      const itemTotal = (menuItem.price + (item.customizations?.reduce((sum, custom) => sum + custom.price, 0) || 0)) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price,
        customizations: item.customizations || [],
        specialInstructions: item.specialInstructions
      });
    }

    // Get restaurant details for delivery fee
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return res.status(400).json({ error: 'Restaurant not found' });
    }

    const deliveryFee = restaurantDoc.deliveryFee;
    const tax = subtotal * 0.1; // 10% tax
    const discount = 0; // Calculate based on promo code
    const totalAmount = subtotal + deliveryFee + tax - discount;

    // Create order
    const order = new Order({
      customer,
      restaurant,
      items: orderItems,
      deliveryAddress,
      subtotal,
      deliveryFee,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      promoCode,
      estimatedDeliveryTime: new Date(Date.now() + restaurantDoc.deliveryTime.max * 60000)
    });

    await order.save();

    // Populate and return order
    const populatedOrder = await Order.findById(order._id)
      .populate('restaurant', 'name cuisine rating')
      .populate('items.menuItem', 'name price images');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryAgent } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        status,
        ...(deliveryAgent && { deliveryAgent }),
        ...(status === 'delivered' && { actualDeliveryTime: new Date() })
      },
      { new: true, runValidators: true }
    )
    .populate('customer', 'name phone')
    .populate('restaurant', 'name')
    .populate('deliveryAgent', 'name phone');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_update', {
        orderId: order._id,
        status: order.status,
        timestamp: new Date()
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.put('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { 
        status: 'cancelled',
        notes: reason
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_cancelled', {
        orderId: order._id,
        reason,
        timestamp: new Date()
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get restaurant orders
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const query = { restaurant: restaurantId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order analytics
router.get('/analytics/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = { restaurant: restaurantId };
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    const orders = await Order.find(query);
    
    const analytics = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
      statusBreakdown: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
