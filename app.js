// Importing required modules
const express = require('express'); // Express web framework
const morgan = require("morgan"); // HTTP request logger middleware
const dotenv = require('dotenv'); // To load environment variables from .env file
const path = require('path'); // Core module to work with file and directory paths
const cors = require('cors');

const cookieParser = require("cookie-parser");


// Load environment variables from config.env file
dotenv.config({ path: './config.env' });

// Importing route handler for homepage views
const homeRoute  = require('./routes/viewroute');
const authsRoute = require('./routes/authRoute');
const productRoute = require('./routes/productRoute');
const toursRoute = require('./routes/tourRoute');
const usersRoute = require('./routes/userRoute');
const bookingRoute = require('./routes/bookingRoute');
const webhockRoute = require('./routes/webhockRoute');

// Creating an Express application
const app = express();

// 1) MIDDLEWARE

// Logging HTTP requests in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan("dev")); // Morgan logs request details like method, URL, status, and time in dev mode
}

// Serving static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors()); // To enable CORS for the frontend
// Middleware to parse JSON data in incoming requests
app.use(express.json()); 
app.use(cookieParser());

// Custom middleware to log a message on each request
app.use((request, response, next) => {
  console.log("Hello from middleware");
  next(); // Proceed to the next middleware or route handler
});

// Custom middleware to add the current request time to each request object
app.use((request, response, next) => {
  request.requestTime = new Date().toISOString(); // Adds a 'requestTime' property to the request object
  next(); // Proceed to the next middleware or route handler
});

// Setting Pug as the view engine for rendering server-side templates
app.set('view engine', 'pug');

// Setting the directory where Pug views are stored
app.set('views', path.join(__dirname, 'views'));

// 2) ROUTE HANDLERS
// (No additional route handlers here yet)
app.get('/api/products', (req, res) => {
  console.log('Products endpoint was called');
  const products = [
    { id: 1, name: "Product 1", price: 29.99 },
    { id: 2, name: "Product 2", price: 19.99 },
    { id: 3, name: "Product 3", price: 9.99 }
  ];
  res.json(products);
});



// 3) ROUTES
app.use('/', homeRoute);
app.use('/api/v1/tour', toursRoute);
app.use('/api/v1/user', usersRoute);
app.use('/api/v1/auth', authsRoute);
app.use('/api/v1/booking', bookingRoute);
app.use('/api/v1/product', productRoute);
app.use(webhockRoute);

app.use(express.json());


// 4) START SERVER
module.exports = app;
