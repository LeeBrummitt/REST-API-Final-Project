var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://omega.unasec.info/";
const express = require('express');
var mongojs = require('mongojs');
const app = express();


app.get('/', function(request, response) {  response.sendfile(__dirname + "/index.html");});  //index.html is a seperate file

app.listen(8080);

//Get a review      ***COMPLETE***
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
                if (err) response.send(err);
                else response.send(results[0]);
            });
        }
        catch(err){
            response.send("ERROR: " + err);
        }
    });
    
});

//Get random reviews by stars
app.get('/server/review/:n/:stars', function(req, response) {
    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        try{
            db.db("amazon").collection("reviews").aggregate([
                { 
                    $limit : parseInt(req.params.n) * 1000     //so we dont have to go through the whole thing
                },
                {
                    $unwind: {
                        path:'$review'
                    }
                },
                { 
                    $limit : parseInt(req.params.n)             //so we dont have to go through the whole thing
                }
            ]).toArray(function(err, results) {
                if (err) response.send(err);
                else response.send(results);
            });
        }
        catch(err){
            response.send("ERROR: " + err);
        }
    });
    
});

//Get random reviews by date
app.get('/server/review/:n/:from_date/:to_date', function(req, response) {
    
});

//Add a review
app.post('/server/review/:reviewid', function(req, response) {
    
});

//Update a review
app.put('/server/review/:reviewid', function(req, response) {
    
});

//Delete a review
app.delete('/server/review/:reviewid', function(req, response) {
    
});

//Get an average of review stars over time
app.get('/server/review/:from/:to', function(req, response) {
    
});

//Get an average of helpful votes by product
app.get('/server/review/helpful/:prodid', function(req, response) {
    
});

//Get average review info for a customer by category 
app.get('/server/review/info/:custid', function(req, response) {
    
});