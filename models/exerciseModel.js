const express = require("express");
const mongoose = require('mongoose');

const exerciseSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description: {
        type: String
    },
    duration: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ExerciseModel', exerciseSchema);