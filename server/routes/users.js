const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router
  .route("/:id")
  .get(getUser, (req, res) => {
    res.json(res.user);
  })
  .patch(getUser, async (req, res) => {
    try {
      if (req.body.name != null) {
        await res.user.updateOne({ $set: { name: req.body.name } });
      }
      if (req.body.email != null) {
        await res.user.updateOne({ $set: { email: req.body.email } });
      }
      if (req.body.password != null) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        await res.user.updateOne({ $set: { password: hashedPassword } });
      }
      res.json(res.user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .delete(getUser, async (req, res) => {
    try {
      await res.user.deleteOne();
      res.json({ message: "User deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword });
    const savedUser = await newUser.save();
    const token = jwt.sign({ id: savedUser.id }, process.env.JWT_SECRET);
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

function getUser(req, res, next) {
  try {
    const user = User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "Cannot find user" });
    }
    res.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = router;
