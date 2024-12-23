const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middlewares

app.use(cors());
app.use(express.json());

//root

app.get("/", (req, res) => {
  res.send("Study Buddies Server is Running");
});

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@main.h0ug1.mongodb.net/?retryWrites=true&w=majority&appName=main`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // db and collections

    const database = client.db("study-buddies");
    const usersCollection = database.collection("users");
    const assignmentsCollection = database.collection("assignments");

    //users data

    app.post("/users", async (req, res) => {
      const userData = req.body;
      const userEmail = req.body.email;
      const filter = { email: userEmail };
      const data = await usersCollection.findOne(filter);
      if (data === null) {
        const result = await usersCollection.insertOne(userData);
        res.send(result);
        return;
      }
      res.send({ response: "user already added" });
    });

    // assignment related apis

    app.post("/assignments", async (req, res) => {
      const assignment = req.body;
      console.log(assignment);
      const result = await assignmentsCollection.insertOne(assignment);
      res.send(result);
    });

    app.get("/assignments", async (req, res) => {
      const cursor = assignmentsCollection.find();
      const result = await cursor.toArray();
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

app.listen(port, () => {
  console.log("Sever running on port: ", port);
});
