const mongoose = require('mongoose');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    token: { type: String, default: () => uid2(32) },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "roles", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "services" },
    ticketsAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: "tickets" }],
    email: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    createdDate: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
  });

userSchema.pre('save', async function (next) { 
  this.password = bcrypt.hash(this.password); 
next(); 
});

const User = mongoose.model('users', userSchema);

module.exports = User;
