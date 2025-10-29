// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const userRoute = require('./routes/user.route.js');
const jobsRoute = require('./routes/jobOrder.route.js');

const app = express();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],  // Only allow resources from same origin
            scriptSrc: ["'self'"],   // Only allow scripts from same origin
            styleSrc: ["'self'"],    // Only allow styles from same origin
            imgSrc: ["'self'"],      // Only allow images from same origin
            connectSrc: ["'self'"],   // Only allow API calls to same origin
            frameSrc: ["'none'"],    // Don't allow the API to be embedded in iframes
            objectSrc: ["'none'"],    // Don't allow plugins
            upgradeInsecureRequests: [],  // Upgrade HTTP requests to HTTPS when possible
        },
    },
    crossOriginEmbedderPolicy: true,    // Prevent resources from loading in cross-origin iframes
    crossOriginOpenerPolicy: { policy: "same-origin" },  // Isolate application from cross-origin windows
    crossOriginResourcePolicy: { policy: "same-site" },  // Allow resources to be shared within same site
    referrerPolicy: { policy: "no-referrer" },  // Don't send referrer information
    strictTransportSecurity: {  // Force HTTPS
        maxAge: 31536000,      // 1 year
        includeSubDomains: true
    },
    xFrameOptions: { action: "deny" }  // Prevent clickjacking
}));

// CORS Middleware
app.use(cors({
    origin: '*', // For development - allows all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
// app.use('/api/devices', deviceRoute);
app.use('/api/users', userRoute);
app.use('/api/jobs', jobsRoute);

app.get('/', (req, res) => {
    res.send("Hello from API...");
});

// process.env.MONGO_URI
// mongodb+srv://abdullah:vPe3JzHuEZLjBUiX@joddb-db.uhzo2ij.mongodb.net/joddb-API?appName=JODDB-DB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
	newFunction();
})
.catch(() => {
	console.log("connection failed");
});

function newFunction() {
	const PORT = process.env.PORT || 3000 // fallback for local
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`)
	})
}
