require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");

const app = express();
app.use(session({ secret: "google" }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
const GoogleStrategy = require("passport-google-oauth20").Strategy;

app.use(express.json());
function upsert(array, item) {
  const i = array.findIndex((_item) => _item.email === item.email);
  if (i > -1) array[i] = item;
  else array.push(item);
}
const users = [];
app.post("/api/success", async (req, res) => {
  const { googleId, email } = req.body;
  upsert(users, { googleId, email });
  res.status(201);
  res.json({ googleId, email });
});
///////////////

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/redirect",
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);
passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (user, cb) {
  cb(null, user);
});

app.get(
  "/api/redirect",
  passport.authenticate("google", {
    successRedirect: "/api/success",
    failureRedirect: "api/fail",
  })
);

app.get(
  "/api/auth",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.listen(process.env.PORT || 5000, () => {
  console.log("server is ready " + process.env.PORT);
});
