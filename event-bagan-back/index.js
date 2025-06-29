require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 9000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
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

    // Signup
    app.post("/users", async (req, res) => {
      const { name, email, password, photoUrl } = req.body;

      const user = await users.findOne({ email });
      if (user)
        return res.status(400).json({ message: "Email already in use." });

      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);

      const newUser = {
        name,
        email,
        password: hashedPass,
        photoUrl,
        joinedEvents: [],
        createdAt: new Date(),
      };
      const result = await users.insertOne(newUser);

      const response = {
        _id: result.insertedId,
        name,
        email,
        photoUrl,
        createdAt: newUser.createdAt,
      };
      res.send(response);
    });

    // Get

    // Single UserData

    // AllEvents (have to filter out in a way so that joined events for that user show 'already joined')
    app.get("/allevents", async (req, res) => {
      const result = await allevents.find().sort({ createdAt: -1 }).toArray();
      res.send(result);
    });

    // SingleEvent
    app.get("/allevents/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allevents.findOne(query);
      res.send(result);
    });

    // MyEvents (Created)
    app.get("/myevents/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await allevents
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // MyEvents (Joined)
    app.get("/myjoinedevents/:email", async (req, res) => {
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
    app.post("/events", async (req, res) => {
      const {
        title,
        name,
        email,
        date,
        time,
        location,
        description,
        attendeeCount,
      } = req.body;
      const newEvent = {
        title,
        name,
        email,
        date,
        time,
        location,
        description,
        attendeeCount,
        createdAt: new Date(),
      };
      const result = await allevents.insertOne(newEvent);
      res.send(result);
    });

    // Put

    // SingleEvent Update
    app.put('/events/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedEvent = req.body;
      const newEvent = {
        $set: {
          title: updatedEvent.title,
          name: updatedEvent.name,
          email: updatedEvent.email,
          date: updatedEvent.date,
          time: updatedEvent.time,
          location: updatedEvent.location,
          description: updatedEvent.description,
          attendeeCount: updatedEvent.attendeeCount,
        }
      }
      const result = await allevents.updateOne(filter, newEvent, options);
      res.send(result);
    })

    // User's Joined Events Array Update

    // Event's User Count Update

    // Delete

    // SingleEvent (Created)

    // SingleEvent (Only from Joined List) (Is this a Put operation? cause modifying array here)

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("TheGuide server is running!");
});

app.listen(port, () => {
  console.log(`TheGuide server is running on port ${port}`);
});
