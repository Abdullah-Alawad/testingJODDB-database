// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Device = require('./models/device.model.js');
const deviceRoute = require('./routes/device.route.js');

const app = express();

// Middleware
app.use(cors()); // allow React frontend to call this API
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/devices', deviceRoute);

app.get('/', (req, res) => {
    res.send("Hello from API...");
});


mongoose.connect("mongodb+srv://abdullah:vPe3JzHuEZLjBUiX@joddb-db.uhzo2ij.mongodb.net/joddb-API?appName=JODDB-DB")
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
