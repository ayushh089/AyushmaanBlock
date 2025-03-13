const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const challengeRouter = require("./routes/challenge");
const uploadFileRouter = require("./routes/uploadFile");
const fetchRecordRouter=require("./routes/fetchRecord")


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/register", registerRouter);
app.use("/login",loginRouter)
app.use("/challenge",challengeRouter)
app.use("/upload",uploadFileRouter);
app.use("/fetchData",fetchRecordRouter);
app.listen(5000, () => {
    console.log("Server is running 3000");
  });
