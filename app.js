const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/task");
const auth = require("./middleware/is-auth");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.get("/", (req, res, next) => {
  res.send("you are good");
});

app.use(authRoutes);
app.use(taskRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://srinivasan:Taa89jG9Uekzvx@cluster0.jzhzr.mongodb.net/todos?retryWrites=true&w=majority"
  )
  .then((res) => {
    app.listen(process.env.PORT || 8080, () => {
      console.log(
        `Example app listening at http://localhost:${process.env.PORT || 8080}`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
