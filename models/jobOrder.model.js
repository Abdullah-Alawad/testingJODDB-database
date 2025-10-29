const mongoose = require("mongoose");

// ===== Task Schema =====
const TaskSchema = new mongoose.Schema({
	taskType: {
		type: String,
		enum: ["production", "quality", "testing"],
		required: true,
	},

	taskName: {
		type: String,
		required: true,
		// later in the UI you can restrict options based on taskType
	},

	minOutput: {
		type: Number,
		default: 0,
	},

	actualOutput: {
		type: Number,
		default: 0,
	},

	currentTime: {
		type: Number,
		default: 0,
	},

	startTime: {
		type: Date,
	},

	endTime: {
		type: Date,
	},

	date: {
		type: Date,
		default: Date.now,
	},

	department: {
		type: String,
		enum: ["quality", "production", "testing"],
		required: true,
	},

	technicians: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],

	status: {
		type: String,
		enum: ["done", "undone"],
		default: "undone"
	},

	taskResponse: {
		type: String,
		enum: ["accepted", "denied", "pending"],
		default: "pending"
	}
});

// ===== Device Schema =====
const DeviceSchema = new mongoose.Schema({
	deviceName: {
		type: String,
		required: [true, "Device name is required"],
	},
	serialNumber: {
		type: String,
		required: [true, "Serial number is required"],
	},
	tasks: [TaskSchema], // nested tasks
});

// ===== Job Order Schema =====
const JobOrderSchema = new mongoose.Schema(
	{
		jobOrderName: {
			type: String,
			required: [true, "Job order name is required"],
		},
		devices: [DeviceSchema], // nested devices
	},
	{ timestamps: true }
);

module.exports = mongoose.model("JobOrder", JobOrderSchema);