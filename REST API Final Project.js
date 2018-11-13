var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://omega.unasec.info/";
const express = require('express');
var mongojs = require('mongojs');
const app = express();


app.get('/', function(request, response) {  response.sendfile(__dirname + "/index.html");});  //index.html is a seperate file

app.listen(8080);

//"API Specifications (this may change and evolve)"

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    
    //Get a review      ***COMPLETE***
    app.get('/server/review/:reviewid', function(req, response) {
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
    
    //Get random reviews by stars       ***COMPLETE***      ---CHECK---
    app.get('/server/review/:n/:stars', function(req, response) {
        try{
            db.db("amazon").collection("reviews").aggregate([
                { 
                    $limit : parseInt(req.params.n) * 1000     //so we dont have to go through the whole thing
                },
                {
                    $unwind: '$review'
                },
                {
                    $match: {
                        "review.star_rating": {$eq: parseInt(req.params.stars) }
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
    
    //Get random reviews by date        ***COMPLETE***
    app.get('/server/review/:n/:from_date/:to_date', function(req, response) {
        try{
            db.db("amazon").collection("reviews").aggregate([
                {
                    $match: {
                        "review.date": {$gt: new Date(Date.parse(req.params.from_date)) },
                        "review.date": {$lt: new Date(Date.parse(req.params.to_date)) }
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
    
    //Add a review
    app.post('/server/review/:reviewid', function(req, response) {
        
    });
    
    //Update a review
    app.put('/server/review/:reviewid', function(req, response) {
        
    });
    
    //Delete a review       ***COMPLETE***
    app.delete('/server/review/:reviewid', function(req, response) {
        try{
            if (db.db("amazon").collection("reviews").deleteOne(
                {_id: mongojs.ObjectID(req.params.reviewid)}
            )) response.send("Item appears to have been deleted");
        }
        catch(err){
            response.send("ERROR: " + err);
        }
    });
    
    //"Additional Aggregations (NOTE: some of these may take way to long and timeout the http request)"
    
    //Get an average of review stars over time      ~~~NOT WORKING~~~
    app.get('/server/review/average/:from/:to', function(req, response) {
        try{
            db.db("amazon").collection("reviews").aggregate([
                { 
                    $limit : 1000     //so we dont have to go through the whole thing
                },
                { $project: { 
                    value: "$review.star_rating",
                    TotalValue: { $sum: "$review.star_rating" },
                    count: { $sum: 1 },
                    Average: {$divide: [ "$TotalValue", "$count" ] },
                    "review.star_rating": 1 
                } }
            ]).toArray(function(err, results) {
                if (err) response.send(err);
                else response.send(results);
            });
        }
        catch(err){
            response.send("ERROR: " + err);
        }
    });
    
    //Get an average of helpful votes by product
    app.get('/server/review/helpful/:prodid', function(req, response) {
        
    });
    
    //Get average review info for a customer by category 
    app.get('/server/review/info/:custid', function(req, response) {
        
    });

});