const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const shortUrl = require('./models/shortUrl')

mongoose.connect('mongodb://localhost/shortUrls')

app.use(bodyParser.json())
app.use(cors())
// static files
app.use(express.static(__dirname + '/public'))

app.get('/new/:urlToShorten(*)', (req, res, next)=>{
	//es5 shorthand for var urlToShorten = req.params.urlShorten
	var { urlToShorten } = req.params;
	var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
	var regex = expression;
	if(regex.test(urlToShorten)) {
		var short = Math.floor(Math.random()*100000).toString();
		var data = new shortUrl(
		{
			originalUrl: urlToShorten,
			shorterurl: short
		})
		data.save(err=>{
			if(err) {
				return res.send('Error saving to database')
			}
		})
		return res.json(data);
	} else {
		return res.json('InvalidUrl')
	}
	
})

//query database and forward original url
app.get('/:urlForward', (req, res, next)=>{
	var { shorterUrl } = req.params.urlForward;
	shortUrl.findOne({'shorterUrl': shorterUrl}, (err, data)=>{
		if(err) return res.send('Error reading database')
		var re = new RegExp('^(http|https)://', 'i');
		var strToCheck = data.originalUrl;
		if(re.test(strToCheck)) {
			res.redirect(301, data.originalUrl);
		} else {
			res.redirect(301, 'http://' + data.originalUrl);
		}
	})
})


app.listen(3000, ()=>{
	console.log('u r on port 3k')
});