require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } = require('date-fns');

const app = express();
const port = process.env.PORT || 9000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(cookieParser());

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    req.user = decoded;
    next();
  });
};

const getDateRange = (filterType) => {
  const now = new Date();

  switch (filterType) {
    case 'today':
      return {
        $gte: startOfDay(now),
        $lte: endOfDay(now)
      };
    case 'currentWeek':
      return {
        $gte: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        $lte: endOfWeek(now, { weekStartsOn: 1 })
      };
    case 'lastWeek':
      const lastWeek = subWeeks(now, 1);
      return {
        $gte: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        $lte: endOfWeek(lastWeek, { weekStartsOn: 1 })
      };
    case 'currentMonth':
      return {
        $gte: startOfMonth(now),
        $lte: endOfMonth(now)
      };
    case 'lastMonth':
      const lastMonth = subMonths(now, 1);
      return {
        $gte: startOfMonth(lastMonth),
        $lte: endOfMonth(lastMonth)
      };
    default:
      return null;
  }
};

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@cluster0.gr6fcmy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const database = client.db("EventGarden");
    const users = database.collection("Users");
    const allevents = database.collection("AllEvents");

    // Api

    app.get("/me", (req, res) => {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token" });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ user: decoded });
      } catch (err) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
    });

    // Signup
    app.post("/signup", async (req, res) => {
      const { name, email, password, photoUrl, joinedEvents } = req.body;
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ message: "Please fill required fields!" });
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters!" });
      }
      const user = await users.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "Email already in use." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);

      const newUser = {
        name,
        email,
        password: hashedPass,
        photoUrl,
        joinedEvents,
        createdAt: new Date(),
      };
      const result = await users.insertOne(newUser);
      const payload = {
        _id: result.insertedId,
        name,
        email,
        photoUrl,
        joinedEvents,
        createdAt: newUser.createdAt,
      };
      if (result.insertedId) {
        const token = jwt.sign({ email, name, photoUrl }, process.env.JWT_SECRET, {
          expiresIn: "365d",
        });
        res
          .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true, user: payload });
      }
    });

    // Login
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      const user = await users.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid credentials" });

      const isPassCorrect = await bcrypt.compare(password, user.password);
      if (!isPassCorrect)
        return res.status(400).json({ message: "Invalid credentials" });

      const payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
        joinedEvents: user.joinedEvents,
      };

      const token = jwt.sign({ email: user.email, name: user.name, photoUrl: user.photoUrl }, process.env.JWT_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true, user: payload });
    });

    // Logout
    app.post("/logout", async (req, res) => {
      try {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // Get

    // Single UserData
    app.get("/users/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await users.findOne(query);
      res.send(result);
    });

    // AllEvents (With Search and Filter)
    app.get("/allevents", verifyToken, async (req, res) => {
      const searchText = req.query.searchText || '';
      const filterType = req.query.filterType || '';

      const dateFilter = getDateRange(filterType);
      const titleFilter = searchText
        ? { title: { $regex: searchText, $options: "i" } }
        : {};

      const query = {
        ...titleFilter,
        ...(dateFilter && { dnt: dateFilter }),
      };
      const result = await allevents.find(query).sort({ createdAt: -1 }).toArray();
      res.send(result);
    });
    
    // SingleEvent
    app.get("/allevents/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allevents.findOne(query);
      res.send(result);
    });

    // MyEvents (Created)
    app.get("/myevents/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await allevents
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // MyEvents (Joined)
    app.get("/myjoinedevents/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const user = await users.findOne({ email: email });
      const joinedEventIds = (user.joinedEvents || []).map((id) =>
        typeof id === "string" ? new ObjectId(id) : id
      );
      const result = await allevents
        .find({ _id: { $in: joinedEventIds } })
        .toArray();
      res.send(result);
    });

    // Post

    // AllEvents
    app.post("/events", verifyToken, async (req, res) => {
      const {
        title,
        name,
        email,
        dnt,
        location,
        description,
        attendeeCount,
      } = req.body;
      const newEvent = {
        title,
        name,
        email,
        dnt: new Date(dnt),
        location,
        description,
        attendeeCount,
        createdAt: new Date(),
      };
      const result = await allevents.insertOne(newEvent);
      res.send(result);
    });

    // Patch

    // SingleEvent Update
    app.patch("/events/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedEvent = req.body;
      const newEvent = {
        $set: {
          title: updatedEvent.title,
          dnt: updatedEvent.dnt,
          location: updatedEvent.location,
          description: updatedEvent.description,
        },
      };
      const result = await allevents.updateOne(filter, newEvent, options);
      res.send(result);
    });

    // User's Joined Events Array Increase
    app.patch("/usersjoinedincrease/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const eventId = req.body.eventId;
      const updateJoined = {
        $addToSet: {
          joinedEvents: new ObjectId(String(eventId)),
        },
      };
      const result = await users.updateOne(filter, updateJoined, options);
      res.send(result);
    });

    // Event's User Count Increase
    app.patch("/eventscountincrement/:id", verifyToken, async (req, res) => {
      const eventId = req.params.id;
      const filter = { _id: new ObjectId(eventId) };
      const update = { $inc: { attendeeCount: 1 } };
      const result = await allevents.updateOne(filter, update);
      res.send(result);
    });

    // User's Joined Events Array Decrease
    app.patch("/usersjoineddecrease/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const eventId = req.body.eventId;
      const updateJoined = {
        $pull: {
          joinedEvents: new ObjectId(String(eventId)),
        },
      };
      const result = await users.updateOne(filter, updateJoined, options);
      res.send(result);
    });

    // Event's User Count Decrease
    app.patch("/eventscountdecrement/:id", verifyToken, async (req, res) => {
      const eventId = req.params.id;
      const filter = { _id: new ObjectId(eventId) };
      const update = { $inc: { attendeeCount: -1 } };
      const result = await allevents.updateOne(filter, update);
      res.send(result);
    });

    // Delete

    // SingleEvent (Created by that user)
    app.delete("/delete-event/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allevents.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("EventGarden server is running!");
});

app.listen(port, () => {
  console.log(`EventGarden server is running on port: ${port}`);
});
