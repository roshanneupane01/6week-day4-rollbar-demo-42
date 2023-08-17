const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());

// include and initialize the rollbar library with your access token
var Rollbar = require("rollbar");
var rollbar = new Rollbar({
  accessToken: "34357df1629a4685916518a5c3d7a210",
  captureUncaught: true,
  captureUnhandledRejections: true,
});

// record a generic message and send it to Rollbar
rollbar.log("Hello world!");

const students = ["Jimmy", "Timothy", "Jimothy"];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/api/students", (req, res) => {
  rollbar.info("Someone accessed the list of students...");
  res.status(200).send(students);
});

app.post("/api/students", (req, res) => {
  let { name } = req.body;

  const index = students.findIndex((student) => {
    return student === name;
  });

  try {
    if (index === -1 && name !== "") {
      students.push(name);
      rollbar.info("Someone created a new student...");
      res.status(200).send(students);
    } else if (name === "") {
      rollbar.error("Someone submit a blank name! Stop that!");
      res.status(400).send("You must enter a name.");
    } else {
        rollbar.error("Someone tried to clone a student. Nono.")
      res.status(400).send("That student already exists.");
    }
  } catch (err) {
    rollbar.error(err)
    console.log(err);
  }
});

app.delete("/api/students/:index", (req, res) => {
  const targetIndex = +req.params.index;
  rollbar.warning("Someone deleted a student...")
  students.splice(targetIndex, 1);
  res.status(200).send(students);
});

const port = process.env.PORT || 5050;

app.listen(port, () => console.log(`Server listening on ${port}`));
