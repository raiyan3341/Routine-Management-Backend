const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// --- UPDATED CORS MIDDLEWARE ---
app.use(cors({
    origin: [
        "http://localhost:5173", // Local Development (Vite)
        "https://your-frontend-link.vercel.app" // Tomar Frontend deploy korar por link-ta ekhane boshabe
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
}));

app.use(express.json());

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dddbozq.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // client.connect(); // Modern driver-e eta optional
    const routineCollection = client.db("routineDB").collection("schedules");

    // 1. GET: Sob routine data
    app.get('/routine', async (req, res) => {
      const result = await routineCollection.find().toArray();
      res.send(result);
    });

    // 2. DELETE: Slot empty kora
    app.delete('/routine', async (req, res) => {
      const { day, slotIndex } = req.body;
      const filter = { day: day };
      const updateDoc = {
          $set: {
              [`slots.${slotIndex}`]: null
          }
      };
      const result = await routineCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // 3. PATCH: Update/Create slot
    app.patch('/routine', async (req, res) => {
      const { day, slotIndex, subject, code, room } = req.body;
      const filter = { day: day };
      const updateDoc = {
        $set: {
          [`slots.${slotIndex}`]: { subject, code, room }
        }
      };
      const result = await routineCollection.updateOne(filter, updateDoc, { upsert: true });
      res.send(result);
    });

    console.log("Connected to MongoDB & API is ready!");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Routine Management Server is running...');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});