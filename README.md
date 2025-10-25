# 🍕 Food Delivery Backend API

A comprehensive backend API for the food delivery mobile application built with Node.js, Express, and MongoDB.

## 🚀 Features

### ✅ **Authentication & User Management**
- User registration and login
- OTP verification via SMS/Email
- Social login (Google, Facebook)
- JWT token-based authentication
- User profile management

### ✅ **Restaurant Management**
- Restaurant CRUD operations
- Restaurant search and filtering
- Cuisine-based categorization
- Rating and review system
- Operating hours management

### ✅ **Menu Management**
- Menu item CRUD operations
- Category-based organization
- Customization options
- Availability management
- Popular items tracking

### ✅ **Order Management**
- Order creation and processing
- Real-time order tracking
- Order status updates
- Order history
- Order analytics

### ✅ **Payment Integration**
- Multiple payment methods
- Payment processing
- Payment verification
- Refund processing
- Payment history

### ✅ **Location Services**
- Geocoding and reverse geocoding
- Nearby restaurant search
- Delivery area management
- Distance calculations

### ✅ **Real-time Features**
- Socket.io integration
- Live order tracking
- Real-time notifications
- Order status updates

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcryptjs
- **Real-time**: Socket.io
- **Payments**: Stripe, Razorpay
- **SMS**: Twilio
- **Email**: Nodemailer
- **Storage**: Cloudinary
- **Maps**: Google Maps API

## 📁 Project Structure

```
src/
├── controllers/          # Route controllers
├── models/              # Database models
│   ├── User.js         # User model
│   ├── Restaurant.js    # Restaurant model
│   ├── MenuItem.js      # Menu item model
│   └── Order.js         # Order model
├── routes/              # API routes
│   ├── auth.js         # Authentication routes
│   ├── users.js        # User management routes
│   ├── restaurants.js  # Restaurant routes
│   ├── menu.js         # Menu routes
│   ├── orders.js       # Order routes
│   ├── payments.js     # Payment routes
│   └── location.js     # Location routes
├── middleware/          # Custom middleware
├── utils/              # Utility functions
├── services/           # External services
└── server.js           # Main server file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FoodDeliveryBackend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   ```

5. **Run the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📡 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/social-login` - Social login

### **Users**
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile
- `POST /api/users/:userId/addresses` - Add address
- `PUT /api/users/:userId/addresses/:addressId` - Update address
- `DELETE /api/users/:userId/addresses/:addressId` - Delete address

### **Restaurants**
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `GET /api/restaurants/cuisine/:cuisine` - Get restaurants by cuisine
- `GET /api/restaurants/search/:query` - Search restaurants
- `GET /api/restaurants/nearby/:lat/:lng` - Get nearby restaurants

### **Menu**
- `GET /api/menu/restaurant/:restaurantId` - Get restaurant menu
- `GET /api/menu/item/:id` - Get menu item
- `GET /api/menu/categories/:restaurantId` - Get menu categories
- `GET /api/menu/search/:query` - Search menu items

### **Orders**
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/:orderId` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:orderId/status` - Update order status
- `PUT /api/orders/:orderId/cancel` - Cancel order

### **Payments**
- `POST /api/payments/process` - Process payment
- `GET /api/payments/methods` - Get payment methods
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history/:userId` - Get payment history
- `POST /api/payments/refund` - Process refund

### **Location**
- `GET /api/location/current` - Get current location
- `POST /api/location/update` - Update user location
- `GET /api/location/nearby` - Get nearby restaurants
- `POST /api/location/geocode` - Geocode address

## 🔧 Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/fooddelivery

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Payment Gateways
STRIPE_SECRET_KEY=your-stripe-secret-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🧪 Testing the API

### **Health Check**
```bash
curl http://localhost:5000/api/health
```

### **Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123"
  }'
```

### **Get Restaurants**
```bash
curl http://localhost:5000/api/restaurants
```

## 📱 Frontend Integration

The backend is designed to work with the React Native mobile app. Update the mobile app's API configuration:

```javascript
// In your mobile app
const API_BASE_URL = 'http://localhost:5000/api';
```

## 🚀 Deployment

### **Local Development**
```bash
npm run dev
```

### **Production**
```bash
npm start
```

### **Docker (Optional)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Database Schema

### **User Model**
- Personal information
- Authentication data
- Addresses and payment methods
- Preferences and settings

### **Restaurant Model**
- Restaurant details
- Operating hours
- Location and contact info
- Features and ratings

### **MenuItem Model**
- Item details and pricing
- Categories and availability
- Customization options
- Ratings and reviews

### **Order Model**
- Order information
- Items and quantities
- Pricing and payment
- Status and tracking

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting (to be implemented)
- API key validation

## 📈 Performance Optimizations

- Database indexing
- Query optimization
- Caching strategies
- Connection pooling
- Compression

## 🐛 Error Handling

- Centralized error handling
- Custom error messages
- HTTP status codes
- Logging and monitoring

## 📝 API Documentation

The API follows RESTful conventions and returns JSON responses. All endpoints include proper error handling and status codes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please open an issue in the repository.

---

**🎉 Your Food Delivery Backend is Ready!**

The backend provides a complete API for your food delivery mobile app with all the necessary endpoints for authentication, restaurant management, ordering, payments, and real-time features.
