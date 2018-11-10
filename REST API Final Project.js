var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://omega.unasec.info/";
const express = require('express');
var mongojs = require('mongojs');
const app = express();


app.get('/', function(request, response) {  response.sendfile(__dirname + "/index.html");});  //index.html is a seperate file

app.listen(8080);


app.get('/server/review/:reviewid', function(req, response) {
    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        try{
            db.db("amazon").collection("reviews").aggregate([
                {
                    $match: {
                        _id: {$eq: mongojs.ObjectID(req.params.reviewid)}
                        
                    }
                }
            ]).toArray(function(err, results) {
                response.send(results[0]);
            });
        }
        catch(err){
            response.send("ERROR: " + err);
        }
    });
    
});

app.get('/server/review/:n/:stars', function(req, response) {
    response.sendfile(__dirname + "/test2.json");
});

app.get('/server/review/:n/:from_date/:to_date', function(req, response) {
    response.sendfile(__dirname + "/test3.json");
});

app.post('/server/review/:reviewid', function(req, response) {
    response.sendfile(__dirname + "/test4.json");
});

app.put('/server/review/:reviewid', function(req, response) {
    response.sendfile(__dirname + "/test5.json");
});

app.delete('/server/review/:reviewid', function(req, response) {
    response.sendfile(__dirname + "/test6.json");
});