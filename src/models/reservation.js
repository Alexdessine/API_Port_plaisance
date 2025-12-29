const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
    {
        catwayNumber: {
            type: Number,
            required: true,
        },
        clientName: {
            type: String,
            required: true,
            trim: true,
        },
        boatName: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Reservation", reservationSchema);
