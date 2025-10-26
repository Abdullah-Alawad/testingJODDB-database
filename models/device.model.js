const mongoose = require('mongoose')

const DeviceSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Add device name"],
		},
		serialNumber: {
			type: Number,
			required: [true, "Add unique serial number"],
			unique: true,
		},

		components: [
			{
				name: { type: String, required: [true, "add component name"] },
				state: {
					type: String,
					enum: ["not started", "in progress", "finished"],
					default: "not started",
				},
			},
		],

		status: {
			type: String,
			enum: ["not started", "in progress", "finished"],
			default: "not started",
		},

		notes: {
			type: String,
			default: "",
		},

		errorList: {
			type: [String], // can store multiple error messages if needed
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

const Device = mongoose.model("Device", DeviceSchema);

module.exports = Device;