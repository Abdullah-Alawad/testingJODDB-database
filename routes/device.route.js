const express = require("express");
const Device = require("../models/device.model.js")
const router = express.Router();
const 	{ getDevices, getDevice, addDevice, updateDevice, deleteDevice } = require("../controllers/device.controller.js")

router.get('/', getDevices);

router.get('/:id', getDevice);

router.post('/', addDevice);

router.put('/:id', updateDevice);

router.delete('/:id', deleteDevice);

module.exports = router;