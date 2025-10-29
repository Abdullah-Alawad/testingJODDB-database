// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoute = require('./routes/user.route.js');
const jobsRoute = require('./routes/jobOrder.route.js');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // For development - allows all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
// app.use('/api/devices', deviceRoute);
app.use('/api/users', userRoute);
app.use('/api/jobs', jobsRoute);

app.get('/', (req, res) => {
    res.send("Hello from API...");
});


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
