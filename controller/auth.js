const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/user");

const SALT_ROUNDS = 12;

const client = new OAuth2Client(
  "771846533282-ea8m3ip5tk3um6bass6si6qaloj29011.apps.googleusercontent.com"
);

const checkError = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
};

exports.signup = async (req, res, next) => {
  try {
    checkError(req);
    const email = req.body.email;
    const password = req.body.password;
    const hashedPw = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
      email: email,
      password: hashedPw,
    });
    const result = await user.save();
    res.status(201).json({ message: "user created!", userId: result._id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    checkError(req);
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("No user's found with this email");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong Password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "supersecretkeyfinditifyoucan",
      { expiresIn: "1h" }
    );
    res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.googleLogin = async (req, res, next) => {
  const { tokenId } = req.body;
  const result = await client.verifyIdToken({
    idToken: tokenId,
    audience:
      "771846533282-ea8m3ip5tk3um6bass6si6qaloj29011.apps.googleusercontent.com",
  });
  const { email_verified, email } = result.getPayload();
  console.log(email_verified, email);
  if (email_verified) {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        const user = await new User({
          email: email,
        });
        const result = await user.save();
        const token = jwt.sign(
          {
            email: result.email,
            userId: result._id.toString(),
          },
          "supersecretkeyfinditifyoucan",
          { expiresIn: "1h" }
        );
        res.status(200).json({ token: token, userId: result._id.toString() });
      } else if (user) {
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id.toString(),
          },
          "supersecretkeyfinditifyoucan",
          { expiresIn: "1h" }
        );
        res.status(200).json({ token: token, userId: user._id.toString() });
      }
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  } else {
    const error = new Error("Wrong Password");
    error.statusCode = 401;
    throw error;
  }
};
