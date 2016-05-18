// set up server
var express = require("express");
var app = express();
var server = require("http").Server(app);
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.get("/" ,function (req, res) {
    res.redirect("index.html");
})

// include socket.io
var io = require("socket.io").listen(server);

// define our port and mongo information 
var config = require('./config');
var port = process.env.port || config.devPort;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = config.mongoLabsConnectionString;

io.on("connection", function (socket) {
    console.log("connection id:" + socket.conn.id);
    // pass all messages along
    socket.on("message", data => {

        var insertDocument = function (db, callback) {
            if (data.message === 'startrace') {

                db.collection('startRace').insertOne({
                    data
                }, function (err, result) {
                    console.log("Inserted a document into the startRace collection.");
                    callback();
                });
            } else {
                db.collection('raceData').insertOne({
                    data
                }, function (err, result) {
                    console.log("Inserted a document into the raceData collection.");
                    callback();
                });
            }

        };
        MongoClient.connect(url, function (err, db) {
            insertDocument(db, function () {
                db.close();
            });
        });
        //send the data to all connected clients
        io.send(data);
    });
});


server.listen(port, function () {
    console.log("Listening on port %s...", server.address().port);
});


