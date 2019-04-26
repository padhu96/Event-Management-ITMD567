//require is a node function, which says I need this.
//Thus making it equivalent to import
const express = require("express");
//Instance of express i.e similar to calling a constructor
const app = express();
//Setting port for running server
//const port = 3000; ----> Used when running on local server
//The following for Heroku launch
app.set("port", process.env.PORT || 3001);

//To create models so as to check input validations against it
//and easily carry over data transfer
//By default the port is 27017
var mongoose = require("mongoose");
mongoose.connect(
  "mongodb://CREDENTIALS"
);

//Following line is required as we will be using IDs to identify each record i.e event
//Ids are hashed hence a createFromHexString function wil be used later on
var ObjectId = require("mongodb").ObjectID;

//Use the parser for parsing json data
app.use(express.json());
//Use this for accepting and encoding form submissions
//as the form submissions will not be json initially
app.use(express.urlencoded({ extended: true }));

//Set Pug as the view engine
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

//Define a schema
//To maintain a check on data
var eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  date: { type: String, required: true },
  age: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true }
});

//A client instance via a model
//Build the schema to use via a model and interact with mongoose
var Event = mongoose.model("Event", eventSchema);

//Connect to DB
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  // we're connected!
  //call view engine through render() fucntion to design webpage
  //Get for retrieving all values and redesign the page based on that
  app.get("/", (req, res) => {
    Event.find({}, function(err, events) {
      if (err) {
        res.render("error", {});
      } else {
        //used for deleting the test entries made during testing
        //values will vanish after a reload, if not initially
        Event.deleteMany({ title: "Test Title" }, function(err) {
          if (err) {
            res.status(500).send("Internal server error");
          }
        });
      }
      res.render("index", { events: events });
    });
  });

  //Get request to redirect to new event creation page i.e event-form
  app.get("/events/new", (req, res) => {
    res.render("event-form", { title: "New Event", event: {} });
  });

  //Get request to redirect to feedback-form page
  //Feedbacks are then sent via an email through the form action
  app.get("/feedback", (req, res) => {
    res.render("feedback-form", {});
  });

  //Get for retirveing the specific event and preloading the page for Update Page View
  app.get("/events/:id/update", (req, res) => {
    let id = ObjectId.createFromHexString(req.params.id);

    //Find a specific event based on ID
    Event.findById(id, function(err, event) {
      if (err) {
        res.render("error", {});
      } else {
        if (event === null) {
          res.render("error", { message: "Not Found" });
        } else {
          res.render("event-form", { title: "Update Event", event: event });
        }
      }
    });
  });

  //Post request for when create button is clicked and also a redirection to saved page
  app.post("/events/new", (req, res, next) => {
    let newEvent = new Event(req.body);
    //Add to DB a new event
    newEvent.save(function(err, savedEvent) {
      if (err) {
        res.render("error", { event: newEvent, error: err });
      } else {
        res.redirect("/events/" + savedEvent.id);
      }
    });
  });

  //Get for retrieving specific event and redirect to saved information page
  app.get("/events/:id", (req, res) => {
    let id = ObjectId.createFromHexString(req.params.id);

    Event.findById(id, function(err, event) {
      if (err) {
        res.render("error", {});
      } else {
        if (event === null) {
          res.render("error", { message: "Not Found" });
        } else {
          res.render("event-detail", { event: event });
        }
      }
    });
  });

  //Post request against this path to execute the function and update specific event
  app.post("/events/:id/update", (req, res, next) => {
    let id = ObjectId.createFromHexString(req.params.id);

    //API changed recently does not allow an update is not possible without deleting the record
    //Hence this new syntax
    //details used as res already exists in previous function
    Event.updateOne({ _id: id }, { $set: req.body }, function(err, details) {
      if (err) {
        res.render("error", {});
      } else {
        res.redirect("/events/" + id);
      }
    });
  });

  //Post request used to delete as delete button is in a form
  app.post("/events/:id/delete", (req, res) => {
    let id = ObjectId.createFromHexString(req.params.id);
    //deleteOne function to delete a single event record
    Event.deleteOne({ _id: id }, function(err, product) {
      res.redirect("/");
    });
  });

  //
  //
  //
  //The following routes do a similar process but they are set to different routes
  //These are json routes that can call back server to get updated data to refresh
  //data in place. They are also used for testing purposes. See test folder for more
  //
  //
  //

  //Get request against this path execute the function and retrieve all events
  app.get("/api/events", (req, res) => {
    Event.find({}, function(err, event) {
      if (err) {
        res.status(500).send("Internal server error");
      } else {
        res.send(event);
      }
    });
  });

  //Get request against this path execute the function and retrieve specific event
  app.get("/api/events/:id", (req, res) => {
    let id = ObjectId.createFromHexString(req.params.id);

    Event.findById(id, function(err, event) {
      if (err) {
        res.status(500).send("Internal server error");
      } else {
        if (event === null) {
          res.status(404).send("Not found");
        } else {
          res.send(event);
        }
      }
    });
  });

  //Post method for data to be sent to server in that specific path
  app.post("/api/events", (req, res) => {
    let newEvent = new Event(req.body);

    newEvent.save(function(err, savedEvent) {
      if (err) {
        res.status(500).send("There was an internal error");
      } else {
        res.send(savedEvent);
      }
    });
  });

  //Put request against this path execute the function and update specific event
  app.put("/api/events/:id", (req, res) => {
    let id = ObjectId.createFromHexString(req.params.id);
    Event.updateOne({ _id: id }, { $set: req.body }, function(err, details) {
      if (err) {
        res.status(500).send("Internal server error");
      } else {
        res.status(204).send();
      }
    });
  });

  //Delete request against this path to delete a specific event
  app.delete("/api/events/:id", (req, res) => {
    let id = ObjectId.createFromHexString(req.params.id);
    Event.deleteOne({ _id: id }, function(err) {
      if (err) {
        res.status(500).send("Internal server error");
      } else {
        res.status(204).send();
      }
    });
  });

  //End of function
});

//To start server at the port and execute the function
app.listen(process.env.PORT, () =>
  console.log(`Example app listening on the heroku port`)
);

//Export app for server functionality and testing
module.exports.app = app;
module.exports.schema = Event;
