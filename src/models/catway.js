const mongoose = require("mongoose");

const catwaySchema = new mongoose.Schema(
    {
        catwayNumber: {
            type: Number,
            required: true,
            unique: true,
        },
        catwayType: {
            type: String,
            required: true,
            enum: {
                values : ["long", "short"],
                message : "Le type de catway doit être long ou short",  
            },
        },
        catwayState: {
            type: String,
            required: true,
        },
    },
);

module.exports = mongoose.model("Catway", catwaySchema);
