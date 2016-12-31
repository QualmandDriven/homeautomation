var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var app = express();
var connection = mysql.createConnection({
   host: '172.17.0.1',
   user: 'root',
   password: 'password' 
});

connection.query('CREATE DATABASE IF NOT EXISTS homeautomation', function (err) {
    if (err) throw err;
    connection.query('USE homeautomation', function (err) {
        if (err) throw err;
        connection.query('CREATE TABLE IF NOT EXISTS measurements('
            + 'id INT NOT NULL AUTO_INCREMENT,'
            + 'PRIMARY KEY(id),'
            + 'location VARCHAR(100),'
            + 'added datetime DEFAULT CURRENT_TIMESTAMP,'
            + 'humidity decimal(6,4),'
            + 'temperature decimal(6,4)'
            +  ')', function (err) {
                if (err) throw err;
            });
    });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
    res.send('Server is live!')
});

app.get('/api', function (req, res) {
    res.send('API is live!');
});

app.get('/api/homeautomation/measurements/', function (req, res) {
    console.log('GET /api/homeautomation/measurements/');
    connection.query('SELECT * from homeautomation.measurements', function (err, rows, fields) {
        if(err) res.send(err);
        res.send(JSON.stringify(rows));
    })
    
         
});

app.post('/api/homeautomation/measurements/', function (req, res) {
    console.log('POST /api/homeautomation/measurements/')
    var post = {location: req.body.location, added: new Date().toMysqlFormat(), humidity: req.body.humidity, temperature: req.body.temperature};
    console.log('Update with: ' + post);
    connection.query('INSERT INTO homeautomation.measurements SET ?', post,
        function (err, result) {
            if(err) throw err;
            res.send('Measurements added to database with ID: ' + result.id);
        });  
});

/**
 * You first need to create a formatting function to pad numbers to two digits…
 **/
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

/**
 * …and then create the method to output the date string as desired.
 * Some people hate using prototypes this way, but if you are going
 * to apply this to more than one Date object, having it as a prototype
 * makes sense.
 **/
Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

app.listen(8080, function() {
    console.log("Home Automation API listening on port 8080!")
});