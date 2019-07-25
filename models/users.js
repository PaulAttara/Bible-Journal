const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    // token: {
    //     type: String,
    //     required: true,
    // } 
}) 

userSchema.virtual('journalLogs', {
    ref: 'JournalLog',
    localField: '_id',
    foreignField: 'owner'
})


const User = mongoose.model('User', userSchema)  

module.exports = User