const express = require('express');
const mqtt = require('mqtt');
const app = express();
var MongoClient = require('mongodb').MongoClient;
const port = 3000;

var database;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/groupOne", function(err, db) {
  if (!err) {
    console.log("We are connected");
  }
  database = db;
  // db.collection('heartRates').insertMany(docs, function(err, result) {
  //   console.log("Inserted " + result.insertedCount + " items");

  db.collection('heartRates').find({}).toArray(function(err, items) {
    console.log("items size: " + items.length);
    for (x in items) {
      console.log("found: " + items[x].heartRate);
    }

  });
});


var topicPost = "cis541/hw-mqtt/26013f37-2ffe00bae2a9c2852a68f57f5001e87/data";
var topicSub = "cis541/hw-mqtt/26013f37-2ffe00bae2a9c2852a68f57f5001e87/echo";
var options = {
  cmd: 'connect',
  protocolId: 'MQTT', // Or 'MQIsdp' in MQTT 3.1.1
  protocolVersion: 4, // Or 3 in MQTT 3.1
  clean: true, // Can also be false
  clientId: 'my-device',
  keepalive: 0, // Seconds which can be any positive number, with 0 as the default setting
  username: 'mbed',
  password: new Buffer('homework'), // Passwords are buffers
};

var randNum = 0;

var client = mqtt.connect('mqtt:35.188.242.1:1883', options);

client.on('connect', function() {
  client.subscribe(topicSub);
  console.log("Subscribed to topic");
  client.publish(topicPost, '4');
  console.log("Sent a 4");
});

client.on('message', function(topic, message) {
  // message is Buffer
  var insertVal = { id: 1, heartRate: message };
  database.collection('heartRates').insert(insertVal, function(err, result) {

  });
  database.collection('heartRates').find({}).toArray(function(err, items) {
    console.log("items size: " + items.length);
    for (x in items) {
      console.log("found: " + items[x].heartRate);
    }
  });
  console.log(message.toString());
  //client.end()
});

app.get('/data', function(req, res) {
  console.log("Got data request");
  res.send(randNum.toString());
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/www/index.html');
});

function getNewData() {
  randNum = Math.round(Math.random() * 100)
  client.publish(topicPost, randNum.toString());
  console.log("Published " + randNum)
}

setInterval(getNewData, 3000);


app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});