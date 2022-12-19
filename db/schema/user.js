const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema({
	email: String,
	displayName: String,
	permission: String
});

module.exports = mongoose.model('User', userSchema);
