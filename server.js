const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const Exercise = require("./schema");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

mongoose.connect(process.env.URL)
  .then((e) => {
    console.log(`successfully connected`);
  }).catch((e) => {
    console.log(`not connected`);
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", function (req, res) {
  const userName = new Exercise({ username: req.body.username });

  //SAVE DATA USER
  userName.save()
    .then((result) => {
      res.json({
        username: result.username,
        _id: result._id,
      })
    })
    .catch((err) => {
      res.send('not saved')
      console.log(err);
    });
});

app.get("/api/users", function (req, res) {

  //GET ALL DATA USERS
  Exercise.find({}, {
    username: 1,
    __v: 1,
  }
  ).then(list => res.send(list))
    .catch((err) => {
      res.send('not found lists user')
      console.log(err);
    })
});

app.post("/api/users/:_id/exercises", function (req, res) {
  const updateExercise = {
    log: [
      {
        description: req.body.description,
        duration: req.body.duration,
        date: validateDate(req.body.date),
      },
    ],
  };

  const filter = { _id: req.params._id };

  //UPDATE DATA
  Exercise.updateOne(filter, {
    $inc: { count: 1 },
    $push: updateExercise,
  })
    .then(succes => {
      //FIND UPDATED USER AND SHOW LAST LOG
      Exercise.findOne(filter, { log: { $slice: -1, }, })
        .then(docs => {
          res.json({
            _id: docs._id,
            count: docs.count,
            username: docs.username,
            log: [{
              date: docs.log[0].date,
              duration: docs.log[0].duration,
              description: docs.log[0].description
            }]
          });
        })
        .catch(err => console.log(err))

    })
    .catch(err => {
      res.send('not updated');
      console.log(err)
    })

});

app.get("/api/users/:id", function (req, res) {
  const filter = req.params.id;

  //SEARCH USER BY ID
  Exercise.findOne({ _id: filter }, { __v: 0 })
    .then(success => {
      res.json({
        _id: success._id,
        username: success.username,
        count: success.count,
        log: success.log
      });
    })
    .catch((err) => {
      res.send('not found user')
      console.log(err);
    })
});

app.get("/api/users/:id/logs", function (req, res) {
  const filter = req.params.id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  Exercise.findOne({ _id: filter }, { __v: 0 }).limit(limit)
    .then(success => {
      const data = filterDates(success, from, to, limit);
      res.json({
        _id: success._id,
        username: success.username,
        count: success.count,
        log: data,
      });
    })
    .catch((err) => {
      res.send('not found user')
      console.log(err);
    })
});

app.listen(process.env.PORT || 3000, () => {
  console.log("http://localhost:" + 3000);
});

//GENERATE AND VALIDATE DATE
function validateDate(date) {
  if (new Date(date) == "Invalid Date") {
    return new Date().toDateString();
  } else {
    return new Date(date).toDateString();
  }
}

//LIMIT LOGS BY RANGE DATES
function filterDates(data, from, to, limit) {
  let result = data.log;
  if (from) {
    result = result.filter(function (x) {
      return new Date(x.date) >= new Date(from);
    });
  }
  if (to) {
    result = result.filter(function (x) {
      return new Date(to) >= new Date(x.date);
    });
  }
  if (limit) {
    result = result.slice(0, limit);
  }
  return result;
}
