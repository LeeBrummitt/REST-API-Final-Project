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
    
    //Get random reviews by stars       ***COMPLETE***
    app.get('/server/review/:n/:stars', function(req, response) {
        try{
            db.db("amazon").collection("reviews").aggregate([
                { 
                    $limit : parseInt(req.params.n) * 10000     //so we dont have to go through the whole thing
                },
                {
                    $match: {
                        "review.star_rating": {$eq: parseInt(req.params.stars) }
                    }
                },
                { 
                    $sample:{ size: parseInt(req.params.n) }     //was getting fewer results then expected occasionally- increasing initial size seemed  to fix
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
                    $limit : (parseInt(req.params.n) * 10000)     //so we dont have to go through the whole thing
                },
                {
                    $match: {
                        "review.date": {$gt: new Date(Date.parse(req.params.from_date)) },
                        "review.date": {$lt: new Date(Date.parse(req.params.to_date)) }
                    }
                },
                { 
                    $sample: { size: (parseInt(req.params.n) ) }    //was getting fewer results then expected occasionally- increasing initial size seemed  to fix
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
    
    //Add a review      ~~~NOT WORKING~~~
    app.post('/server/review/:reviewid', function(req, response) {
        try{
            db.db("amazon").collection("reviews").insert(
                {
                    _id: mongojs.ObjectID(req.params.reviewid)
                }
            ) 
            response.send("Item appears to have been added");
        }
        catch(err){
            response.send("ERROR: " + err);
        }
    });
    
    //Update a review        ~~~NOT WORKING~~~
    app.put('/server/review/:reviewid/', function(req, response) {
        try{
            db.db("amazon").collection("reviews").update(
                {
                    _id: mongojs.ObjectID(req.params.reviewid)
                },
                {
                    _id: mongojs.ObjectID(req.params.reviewid)
                },
                {
                    
                }
            ) 
            response.send("Item appears to have been updated");
        }
        catch(err){
            response.send("ERROR: " + err);
        }
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
    
    //Get an average of review stars over time          ***COMPLETE***
    app.get('/server/additional/review/average/:from/:to', function(req, response) {
        try{
            db.db("amazon").collection("reviews").aggregate([
                { 
                    $limit: 10000     //so we dont have to go through the whole thing
                },
                {
                    $match: {
                        "review.date": {$gt: new Date(Date.parse(req.params.from)) },
                        "review.date": {$lt: new Date(Date.parse(req.params.to)) }
                    }
                },
                { 
                    $group: 
                    { 
                        _id: null,
                        TotalValue: { $sum: "$review.star_rating" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: 
                    { 
                        _id: 0,
                        Average: {$divide: [ "$TotalValue", "$count" ] },
                        TotalValue: 1,
                        count: 1
                    } 
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
    
    //Get an average of helpful votes by product        ***COMPLETE***
    app.get('/server/additional/review/helpful/:prodid', function(req, response) {
        try{
            db.db("amazon").collection("reviews").aggregate([
                /*
                { 
                    $limit: 1000000     //so we dont have to go through the whole thing
                },                      //seems to run fast enough without, so I commented it out. Leaving it incase I need it later
                */
                {
                    $match: {
                        "product.id": {$eq: req.params.prodid },
                    }
                },
                { 
                    $group: 
                    { 
                        _id: null,
                        TotalValue: { $sum: "$votes.helpful_votes" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: 
                    { 
                        _id: 0,
                        Average: {$divide: [ "$TotalValue", "$count" ] },
                        TotalValue: 1,
                        count: 1
                    } 
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
    
    //Get average review info for a customer by category        ***COMPLETE***
    app.get('/server/additional/review/info/:custid', function(req, response) {
        try{
            db.db("amazon").collection("reviews").aggregate([
                /*
                { 
                    $limit: 1000000     //so we dont have to go through the whole thing
                },                      //seems to run fast enough without, so I commented it out. Leaving it incase I need it later
                */
                {
                    $match: {
                        "customer_id": {$eq: req.params.custid },
                    }
                },
                { 
                    $group: 
                    { 
                        _id: "$product.category",
                        TotalStarValue: { $sum: "$review.star_rating" },
                        TotalHelpfulValue: { $sum: "$votes.helpful_votes" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: 
                    { 
                        _id: 1,
                        StarAverage: {$divide: [ "$TotalStarValue", "$count" ] },
                        HelpfulAverage: {$divide: [ "$TotalHelpfulValue", "$count" ] },
                        TotalStarValue: 1,
                        TotalHelpfulValue: 1,
                        count: 1
                    } 
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