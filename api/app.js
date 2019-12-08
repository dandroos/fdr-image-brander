var createError = require("http-errors");
var express = require("express");
var bodyParser = require("body-parser")
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var multer = require("multer");

const packageFiles = require("./my_modules/packageFiles");
var path = require("path");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.post("/upload", (req, res) => {
  // console.log(req)
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {

      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype.includes("image")) {
        cb(null, true);
      } else {
        return cb(new Error("File(s) not images"), false);
      }
    }
  }).array("file");

  upload(req, res, err => {
    console.log(req.body.dog_name)
    if (err) return res.status(415).send({ error: "invalid file" });

    const state = {
      files: req.files,
      number_of_items: req.files.length,
      dog_name: req.body.dog_name
    };
    packageFiles(state.files, state.dog_name, res);
  });
});

app.get("/download/", (req, res) => {
  const url = path.join(__dirname, req.query.path);
  res.download(req.query.path, err => {
    if (err) throw err;
    // fs.unlink(url, () => {
    //   console.log(`Temp image ${url} successfully deleted.`)
    // })
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;


