const Device = require("../models/device.model.js") 


const getDevices = async (req, res) => {
	try {
		const devices = await Device.find({});
		res.status(200).json(devices);
	} catch (error) {
		res.status(500).json({message: error.message});
	}
}

const getDevice = async (req, res) => {
	try {
		const { id } = req.params;
		const device = await Device.findById(id);
		res.status(200).json(device);
	} catch (error) {
		res.status(500).json({message: error.message});
	}
}

const addDevice = async (req, res) => {
	try {
		const device = await Device.create(req.body);
		res.status(200).json(device);
	} catch (error) {
		res.status(500).json({message: error.message});
	}
}

const updateDevice = async (req, res) => {
	try {
		const { id } = req.params;
		const device = await Device.findByIdAndUpdate(id, req.body);
		if (!device)
			return res.status(404).json({message: "Device not found"});
		const updatedDevice = await Device.findById(id);
		res.status(200).json(updatedDevice);
	} catch (error) {
		res.status(500).json({message: error.message});
	}	
}

const deleteDevice = async (req, res) => {
	try{
		const { id } = req.params;
		const device = await Device.findByIdAndDelete(id);
		if (!device)
			return res.status(404).json({message: "device not found"});
		res.status(200).json({message: "Device deleted successfuly"});
	} catch (error) {
		res.status(500).json({message: error.message});
	}
}

module.exports = {
	getDevices,
	getDevice,
	addDevice,
	updateDevice,
	deleteDevice
};