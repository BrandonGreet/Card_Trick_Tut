const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = process.env.MONGODB_URI || 'mongodb://localhost/database';
const port = process.env.PORT || 5000;
const DB_NAME = process.env.DB_NAME;

// Body parser setup
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Responds to get requests (to secret directory) with secret.html
app.get('/secret', (request, response) => response.sendFile(path.join(__dirname, 'secret.html')));

// Responds to post requests (to secret page)
app.post('/secret', (request, response) => {

	// useNewUrlParser flag: important to use proper parser
	// Connects to the database and creates a new entry, or prints out an error
	MongoClient.connect(url, {useNewUrlParser: true}, (err, clientDB) => {
		if (err) {
			console.log(error);
		} else {
			const db = clientDB.db(DB_NAME);
			const collection = db.collection('names');
			const entry = {
				name: request.body.name.toLowerCase(),
				card: request.body.number + '_of_' + request.body.suit
			};
			collection.insertOne(entry, (err, result) => {
				if (err) {
					console.log(err);
				} else {
					// Sends confirmation back to client if successful
					response.send('Inserted into database');
				}
			});
			clientDB.close();
		}
	});
});

// Responds to 'deleteall' request
// (How I would like to handle it)
app.get('/deleteall', (request, response) => {
	MongoClient.connect(url, {useNewUrlParser: true}, (err, clientDB) => {
		if (err) {
			console.log(err);
		} else {
			const db = clientDB.db(DB_NAME);
			const collection = db.collection('names');

			collection.remove({});
			response.send('database reset');
		}
	})
});

// Responds to requests including specific names
app.get('/:param*', (request, response) => {
	// Index 1 should be the name
	const inputName = request.url.slice(1).toLowerCase();

	MongoClient.connect(url, {useNewUrlParser: true}, (err, clientDB) => {
		if (err) {
			console.log(err);
		} else {
			const db = clientDB.db(DB_NAME);
			const collection = db.collection('names');

			/* How deleteall is handled in tutorial
			if (name === 'deleteall') {
				collection.remove({});
				response.send('database reset');
			}
			An else statement leads into the following code
			*/
			collection.find({name: inputName}).toArray((err, result) => {
				if (err) {
					console.log(err);
				} else if (result.length) {
					const card = result[result.length-1].card + '.png';
					response.sendFile(path.join(__dirname+'/cards/'+card));
				} else {
					respond.sendStatus(404);
				}

				clientDB.close();
			})
		}
	});
});

// Starts application
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));




