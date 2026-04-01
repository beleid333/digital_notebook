// server/index.ts
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware
  app.use(cors());
  app.use(express.json());

  // MongoDB Connection
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri!);
  const dbName = "digital_binder";
  const collectionName = "notes";
  let db: any;

  async function connectDB() {
    try {
      await client.connect();
      db = client.db(dbName);
      console.log("✅ Connected to MongoDB");
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
    }
  }

  // 🔥 API Routes (MUST come BEFORE the catch-all route)

  // Get all notes
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await db
        .collection(collectionName)
        .find()
        .sort({ updatedAt: -1 })
        .toArray();
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

    // Save a new note
  app.post("/api/notes", async (req, res) => {
    try {
      const { title, content, notebook, tags, _id } = req.body;
      
      // Base note data (shared by create & update)
      const baseNoteData = {
        title,
        content,
        notebook,
        tags,
        updatedAt: new Date().toISOString(),
      };

      let result;
      if (_id) {
        // ✅ Update existing note (keep original createdAt)
        result = await db.collection(collectionName).updateOne(
          { _id: new ObjectId(_id) },
          { $set: { ...baseNoteData, updatedAt: new Date().toISOString() } }
        );
        res.json({ _id, ...baseNoteData });
      } else {
        // ✅ Create new note (add createdAt)
        const newNote = {
          ...baseNoteData,
          createdAt: new Date().toISOString(), // ✅ Only for new notes
        };
        result = await db.collection(collectionName).insertOne(newNote);
        res.json({ _id: result.insertedId, ...newNote });
      }
    } catch (error) {
      console.error("Error saving note:", error);
      res.status(500).json({ error: "Failed to save note" });
    }
  });

  // Delete a note
  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // 🌐 Serve Frontend (Production)
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3002;

  // Connect to DB then start server
  await connectDB();
  
  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);