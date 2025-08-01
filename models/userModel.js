const express = require("express");
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('UserModel', userSchema)