const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middlewares

app.use(
  cors({
    origin: "https://study-buddies-by-ashraf.web.app", //"http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    res.user = decoded;
    next();
  });
};

//root

app.get("/", (req, res) => {
  res.send("Study Buddies Server is Running");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const submissionsCollection = database.collection("submissions");

    //JWT related apis

    app.post("/login", async (req, res) => {
      const email = req.body;

      const user = await usersCollection.findOne(email);

      if (!user) {
        return res.status(400).send({ success: false });
      }

      const token = jwt.sign(email, process.env.JWT_SECRET, {
        expiresIn: "5h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "none",
          secure: process.env.NODE_ENV === "production",
        })
        .send({ success: true });
    });

    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .send({ success: true });
    });

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

    app.post("/assignments", verifyToken, async (req, res) => {
      const assignment = req.body;
      const result = await assignmentsCollection.insertOne(assignment);
      res.send(result);
    });

    app.get("/assignments", async (req, res) => {
      const { search, difficulty } = req.query;

      let query = {};

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      if (difficulty && difficulty !== "all") {
        query.difficulty = difficulty;
      }

      const assignments = await assignmentsCollection.find(query).toArray();
      res.send(assignments);
    });

    app.get("/assignments/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await assignmentsCollection.findOne(filter);
      res.send(result);
    });

    app.put("/assignments/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const updatedData = { $set: data };
      const filter = { _id: new ObjectId(id) };

      const result = await assignmentsCollection.updateOne(filter, updatedData);
      res.send(result);
    });

    app.delete("/assignments/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await assignmentsCollection.deleteOne(filter);
      res.send(result);
    });

    //submission related apis

    app.post("/submissions", verifyToken, async (req, res) => {
      const submissionData = req.body;
      const result = await submissionsCollection.insertOne(submissionData);
      res.send(result);
    });

    app.get("/submissions/pending", verifyToken, async (req, res) => {
      const filter = { status: "pending" };
      const cursor = submissionsCollection.find(filter);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/submissions", verifyToken, async (req, res) => {
      const submittedBy = req.query.submittedBy;

      const filter = { examinee_email: submittedBy };
      const cursor = submissionsCollection.find(filter);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.patch("/submissions/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedAssignment = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: updatedAssignment,
      };
      const result = await submissionsCollection.updateOne(filter, updateDoc);
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
