const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const annonceSchema = new Schema({
	title:              String,
	type:               String,
	publication_status: String,
	status:             String,
	description:        String,
	price:              { type: Number, default: 0 },
	date:               { type: Date, default: Date.now },
	photos:             [Buffer],
	questions:          [{
		title:  String,
		author: String,
		answer: {
			title:  String,
			author: String
		}
	}],
});

const Annonce = mongoose.model('Annonce', annonceSchema);
module.exports.Annonce = Annonce;

module.exports.createAnnonce = async (title, type, publication_status, status, description,
	price, date, photos = [], questions = undefined) => {
	const newAnnonce = new Annonce ({
		title, type, publication_status, status, description, price, date, photos, questions
	})
	await newAnnonce.save()

	return newAnnonce
}
