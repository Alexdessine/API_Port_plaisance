const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// on importe le module bcrypt qui permet de hasher les expressions
const bcrypt = require('bcrypt');

const User = new Schema({
    username: {
        type: String,
        trim: true,
        required: [true, 'Le nom d\'utilisateur est obligatoire']
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'l\'email est obligatoire'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        trim: true
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    }
}, {
    // On ajoute les 2 champs createdAt et updatedAt
    timestamps: true
});

// hash du mot de passe quand il est modifié
User.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', User);