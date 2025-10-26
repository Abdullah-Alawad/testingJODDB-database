const express = require("express")
const mongoose = require("mongoose")
const Device = require('./models/device.model.js')
const deviceRoute = require('./routes/device.route.js')

const app = express()

// middleware config
app.use(express.json());
app.use(express.urlencoded({extended: false})) // more research

// routes
app.use('/api/devices', deviceRoute);

app.get('/', (req, res) => {
	res.send("hello from api...");
});


mongoose.connect("mongodb+srv://abdullah:vPe3JzHuEZLjBUiX@joddb-db.uhzo2ij.mongodb.net/joddb-API?appName=JODDB-DB")
.then(() => {
	console.log("data base connected")
	app.listen(3000, () => {
		console.log("server running...");
	});
})
.catch(() => {
	console.log("connection failed");
});