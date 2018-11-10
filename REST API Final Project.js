var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://omega.unasec.info/";
const express = require('express');
var mongojs = require('mongojs');
const app = express();


app.get('/', function(request, response) {  response.sendfile(__dirname + "/index.html");});  //index.html is a seperate file

app.listen(8080);

//seperate test files needed
app.get('/server/review/:reviewid', function(req, response) {
    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("amazon");
        try{
            dbo.collection("reviews").findOne({"_id" : mongojs.ObjectID(req.params.reviewid)}, function(err, result) {
                if (err) throw err;
                response.send(result);
                db.close();
            });
        }
        catch(err){
            response.send("ERROR: An error has occured");
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