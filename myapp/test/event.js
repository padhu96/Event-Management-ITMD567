//Mocha library for testing
let chai = require("chai");
let chaiHttp = require("chai-http");
let serverAndSchema = require("../index");
let server = serverAndSchema.app;
let Event = serverAndSchema.schema;
let should = chai.should();

chai.use(chaiHttp);

//Display the line while testing to inform
//For GET Request
describe("/GET Event", function() {
  //Test case
  it("It should get the specified event", function(done) {
    //Define expected event
    let expectedEvent = new Event({
      title: "Test Title",
      desc: "Test Description",
      date: "Test Date",
      age: "Test Age",
      from: "Test From",
      to: "Test To"
    });

    //Save the event
    expectedEvent.save(function(err, savedEvent) {
      chai
        .request(server)
        //Get the speicfic event
        .get("/api/events/" + savedEvent.id)
        .end((err, res) => {
          //Check for equality of sent event and expected event values
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("title").eql(savedEvent.title);
          res.body.should.have.property("desc").eql(savedEvent.desc);
          res.body.should.have.property("date").eql(savedEvent.date);
          res.body.should.have.property("age").eql(savedEvent.age);
          res.body.should.have.property("from").eql(savedEvent.from);
          res.body.should.have.property("to").eql(savedEvent.to);
          res.body.should.have.property("_id").eql(savedEvent.id);
          done();
        });
    });
  });
});

//Display the line while testing to inform
//For POST Request
describe("/POST Event", function() {
  //Test case
  it("It should post the specified event", function(done) {
    //Create a new event
    let newEvent = new Event({
      title: "Test Title",
      desc: "Test Description",
      date: "Test Date",
      age: "Test Age",
      from: "Test From",
      to: "Test To"
    });

    chai
      .request(server)
      .post("/api/events")
      //Send the new event
      .send(newEvent)
      .end((err, res) => {
        //Check whether values are the same for newEvent and stored event
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("title").eql(newEvent.title);
        res.body.should.have.property("desc").eql(newEvent.desc);
        res.body.should.have.property("date").eql(newEvent.date);
        res.body.should.have.property("age").eql(newEvent.age);
        res.body.should.have.property("from").eql(newEvent.from);
        res.body.should.have.property("to").eql(newEvent.to);
        done();
      });
  });
});

//Display the line while testing to inform
//For POST Request
describe("/PUT", () => {
  it("It should update an existing event", done => {
    //Define an existing event
    let existingEvent = new Event({
      title: "Test Title",
      desc: "Test Description",
      date: "Test Date",
      age: "Test Age",
      from: "Test From",
      to: "Test To"
    });
    //Define an expected event
    let expectedEvent = new Event({
      title: existingEvent.title,
      desc: existingEvent.desc,
      date: existingEvent.date,
      age: existingEvent.age,
      from: existingEvent.from,
      to: existingEvent.to
    });

    existingEvent.save(function(err, event) {
      if (err) return console.error(err);
      chai
        .request(server)
        .put("/api/events/" + event.id)
        .send(expectedEvent)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.be.empty;

          Event.findOne({ _id: existingEvent.id }, function(err, foundEvent) {
            //Check if updated values are the same as expected
            if (err) return console.error(err);
            foundEvent.should.have.property("title").eql(expectedEvent.title);
            foundEvent.should.have.property("desc").eql(expectedEvent.desc);
            foundEvent.should.have.property("date").eql(expectedEvent.date);
            foundEvent.should.have.property("age").eql(expectedEvent.age);
            foundEvent.should.have.property("from").eql(expectedEvent.from);
            foundEvent.should.have.property("to").eql(expectedEvent.to);
            done();
          });
        });
    });
  });
});

//Display the line while testing to inform
//For DELETE Request
describe("/DELETE", () => {
  it("It should delete an existing event", done => {
    //Define an event
    let existingEvent = new Event({
      title: "Test Title",
      desc: "Test Description",
      date: "Test Date",
      age: "Test Age",
      from: "Test From",
      to: "Test To"
    });

    existingEvent.save(function(err, event) {
      if (err) return console.error(err);
      chai
        .request(server)
        //Send it for deletion
        .delete("/api/events/" + existingEvent.id)
        .end((err, res) => {
          res.should.have.status(204);
          res.body.should.be.empty;
          Event.findOne({ _id: existingEvent.id }, function(err, event) {
            //Check if event doesnt exist in DB
            if (err) return console.error(err);
            should.not.exist(event);
            done();
          });
        });
    });
  });
});
