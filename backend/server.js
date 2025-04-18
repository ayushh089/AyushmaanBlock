const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const challengeRouter = require("./routes/challenge");
const uploadFileRouter = require("./routes/uploadFile");
const fetchRecordRouter = require("./routes/fetchRecord");
const fetchProof = require("./routes/fetchProof");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === "http://localhost:5173") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/challenge", challengeRouter);
app.use("/upload", uploadFileRouter);
app.use("/fetchData", fetchRecordRouter);
app.use("/get-merkle-proof",fetchProof)
app.listen(5000, () => {
  console.log("Server is running 5000");
});
