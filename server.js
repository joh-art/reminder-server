const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Lectures = require("./src/models/LectureModel.jsx");
const Users = require("../server1/src/models/UsersModel");
const Reminderforms = require("../server1/src/models/ReminderModel");
 require('dotenv').config();
const SECRETJWT = process.env.SECRETJWT;
const PORT = process.env.PORT || 5000;
const mongoDBURL =
  "mongodb+srv://ohaokey09:DrKIXjjHbtnLGtln@remindercluster.xwt3idy.mongodb.net/reminder?retryWrites=true&w=majority";
// import user from
const app = express();
app.use(express.urlencoded({ extended: true }));





// Connect to MongoDB Atlas
mongoose.connect(mongoDBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check for successful connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB Atlas");
});
app.listen(PORT, () => {
  console.log(`App is listening on port: ${PORT}`);
});
// THE MIDDLEWARES
app.use(cors());
app.use(express.json());

const generateToken = (id) => {
  // Verify that the SECRETJWT environment variable is set consistently
  if (!process.env.SECRETJWT) {
    throw new Error("SECRETJWT is not set. Set it in your environment.");
  }

  // Generate the JWT token with the user's ID and expiration
  return jwt.sign({ id }, process.env.SECRETJWT, {
    expiresIn: "30d",
  });
};


// Middleware to protect routes with JWT
const protectRoute = (req, res, next) => {
  const token = req.header('Authorization');
if (!token || !token.startsWith('Bearer ')) {
  return res.status(401).json({ error: 'Unauthorized' });
}

const tokenValue = token.split(' ')[1]; // Get the token value after "Bearer "

  try {
    // Verify the JWT token
    const decoded = jwt.verify(tokenValue, process.env.SECRETJWT); // Use your JWT_SECRET from environment variables
    req.user = decoded.users; // Store the user object in req for further use
    next(); // User is authenticated, continue to the route
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Protected Profile route
app.get('/users/:id', protectRoute, (req, res) => {
  // Retrieve user information from the req.user object
  const user = req.user;

  // Send the user's profile information as a response
  res.json({
    name: user.username, // Assuming you have a "name" property in your user object
    email: user.email, // Assuming you have an "email" property in your user object
  });
});




// Register a new user
app.post("/register", async (req, res) => {
  try {
    // Check if any of the required fields is missing
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).send({
        message: "Please provide username, email, and password",
      });
    }

    // Check if the email already exists
    const emailToSearch = req.body.email; // Extract email from the request body
    const existingUser = await Users.findOne({ email: emailToSearch });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: `User with the email already exist` });
    }

    // Check if the username already exists
    let newUsername = req.body.username; // Assuming you get the username from the request body
    let usernameExists = true;
    while (usernameExists) {
      const userWithSameUsername = await Users.findOne({
        username: newUsername,
      });
      if (!userWithSameUsername) {
        usernameExists = false;
      } else {
        // Append a timestamp to the username
        const timestamp = Date.now();
        newUsername = `${req.body.username}_${timestamp}`;
      }
    }

    // Create a new user
    const newUser = new Users({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    await newUser.save();

    // Generate a JWT token for the newly registered user
    const token = generateToken(newUser._id);

    res.status(201).json({ message: "Registration successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await Users.findOne({ email });

    // If the user does not exist, return an error
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check if the provided password matches the user's password
    if (password === user.password) {
      // Passwords match, so you can consider the user logged in
      // Generate a JWT token for the authenticated user
      const token = generateToken(user._id);

      // In this example, we're just sending a success response
      return res.status(200).json({ message: "Login successful", token, user });
    } else {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a single user by ID
app.put("users/:id", protectRoute, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Find the user by ID
    const user = await Users.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user properties
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a user by ID
app.delete("/users/:id",protectRoute, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Find the user by ID
    const user = await Users.findByIdAndRemove(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// GET a single user by ID
app.get('/users/:id',protectRoute, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Find the user by ID
    const user = await Users.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// GET all users
app.get('/users',protectRoute, async (req, res) => {
  try {
    // Find all users in the database
    const users = await Users.find();

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//CREATE
app.post("/Reminderforms", async (req, res, next) => {
  try {
    // Extract data from the request body
    const { lecturetitle, date, time } = req.body;

    // Check if lecturetitle, date, and time are provided
    if (!lecturetitle || !date || !time) {
      return res.status(400).json({
        error: "Please provide lecturetitle, date, and time",
      });
    }

    // Create a new Reminderforms object
    const newReminderform = new Reminderforms({
      lecturetitle,
      date,
      time,
    });

    // Save the new Reminderforms object to the database
    const savedReminderform = await newReminderform.save();

    // Return the created Reminderforms object as JSON
    res.status(201).json(savedReminderform);
  } catch (err) {
    next(err);
  }
});

//UPDATE
// Assuming you have imported the necessary modules and defined the Reminderforms model

// Update a Reminderform by ID
app.put("/Reminderforms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { lecturetitle, date, time } = req.body;

    // Check if lecturetitle, date, or time are provided
    if (!lecturetitle && !date && !time) {
      return res.status(400).json({
        error:
          "Please provide at least one field to update (lecturetitle, date, or time).",
      });
    }

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    // Find the Reminderform by ID
    const reminderform = await Reminderforms.findById(id);

    if (!reminderform) {
      return res.status(404).json({
        error: "Reminderform not found.",
      });
    }

    // Update the fields if provided
    if (lecturetitle) {
      reminderform.lecturetitle = lecturetitle;
    }
    if (date) {
      reminderform.date = date;
    }
    if (time) {
      reminderform.time = time;
    }

    // Save the updated Reminderform
    const updatedReminderform = await reminderform.save();

    res.status(200).json(updatedReminderform);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//DELETE
// Delete a Reminderform by ID
app.delete("/reminderforms/:id", async (req, res) => {
  try {
    // Find the Reminderform by ID and remove it
    const deletedReminderform = await Reminderforms.findByIdAndRemove(
      req.params.id
    );

    if (!deletedReminderform) {
      return res.status(404).json({
        error: "Reminderform not found.",
      });
    }

    res.status(200).json({ message: "Reminderform deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//GET

// Get a single Reminderform by ID
// Get a single Reminderform by ID
// Get a Reminderform by ID
// app.get("/Reminderforms/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find the Reminderform by ID
//     const reminderform = await Reminderforms.findById(id);

//     if (!reminderform) {
//       return res.status(404).json({
//         error: "Reminderform not found.",
//       });
//     }

//     res.status(200).json(reminderform);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.get("/Reminderforms", async (req, res) => {
//   try {
//     // Find all Reminderforms in the database
//     const reminderforms = await Reminderforms.find();

//     res.status(200).json(reminderforms);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// Route for Get All Reminderforms
app.get("/Reminderforms", async (req, res) => {
  try {
    const reminderforms = await Reminderforms.find({});

    res.status(200).json(reminderforms);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "server error" });
  }
});

// Route for Get One Reminderform by ID
app.put("/Reminderforms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { lecturetitle, date, time } = req.body;

    // Check if 'id' is a valid ObjectId before querying the database
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ObjectId" });
    }
    // Check if lecturetitle, date, or time are provided
    if (!lecturetitle && !date && !time) {
      return res.status(400).json({
        error:
          "Please provide at least one field to update (lecturetitle, date, or time).",
      });
    }

    // Find the Reminderform by ID
    const reminderform = await Reminderforms.findById(id);

    if (!reminderform) {
      return res.status(404).json({
        error: "Reminderform not found.",
      });
    }

    // Update the fields if provided
    if (lecturetitle) {
      reminderform.lecturetitle = lecturetitle;
    }
    if (date) {
      reminderform.date = date;
    }
    if (time) {
      reminderform.time = time;
    }

    // Save the updated Reminderform
    const updatedReminderform = await reminderform.save();

    res.status(200).json(updatedReminderform);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all lectures
app.get("/lectures", async (req, res) => {
  try {
    const lectures = await Lectures.find();
    res.status(200).json(lectures);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new lecture
app.post("/lectures", async (req, res) => {
  try {
    const lecture = new Lectures(req.body);
    await lecture.save();
    res.status(201).json(lecture);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update a lecture by ID
app.put("/lectures/:id", async (req, res) => {
  try {
    const updatedLecture = await Lectures.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedLecture) {
      return res.status(404).json({ error: "Lecture not found" });
    }
    res.status(200).json(updatedLecture);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a lecture by ID
app.delete("/lectures/:id", async (req, res) => {
  try {
    const deletedLecture = await Lectures.findByIdAndRemove(req.params.id);
    if (!deletedLecture) {
      return res.status(404).json({ error: "Lecture not found" });
    }
    res.status(200).json({ message: "Lecture deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

