// server/index.ts
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from './models/User.js';
// ── Type Definitions ──────────────────────────────────────────────────────
interface NotebookDoc {
  id: string;
  title: string;
  color: string;
  spineAccent: string;
  emoji: string;
  sections?: string[];
  updatedAt?: string;
}

interface SectionDoc {
  id: string;
  title: string;
  notebookId: string;
  tabColor: string;
  tabColorDark: string;
  tabTextColor: string;
}

interface PageDoc {
  id: string;
  sectionId: string;
  title: string;
  content: string;
  stickyNotes: any[];
  tapedImages: any[];
}

interface BinderDataDoc {
  notebooks: NotebookDoc[];
  sections: SectionDoc[];
  pages: Record<string, PageDoc>;
  activeNotebookId: string;
  activeSectionId: string;
}

interface UserDoc {
  _id: any;
  email: string;
  username: string;
  password: string;
  binderData: BinderDataDoc;
  createdAt: string;
  updatedAt: string;
}

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-change-in-production ";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',           // Local frontend dev
    'https://velonotes.com',           // Production domain
    'https://velonotes.pages.dev',     // Cloudflare Pages preview
    'https://digital-notebook.pages.dev' // Old Cloudflare URL (if still used)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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

  // ── Authentication Routes ──────────────────────────────────────────────

// REGISTER: Create new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    const existingUser = await db.collection('users').findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already taken' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user with default binder data
    const newUser = {
      email,
      username,
      password: hashedPassword,
      binderData: {
        notebooks: [],
        sections: [],
        pages: {},
        activeNotebookId: '',
        activeSectionId: '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId, email, username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Return user (without password) + token
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({ 
      success: true, 
      token,
      user: { ...userWithoutPassword, id: result.insertedId.toString() }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// LOGIN: Authenticate user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Find user by email or username
    const user = await db.collection('users').findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Return user (without password) + token
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      token,
      user: { ...userWithoutPassword, id: user._id.toString() }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// GET USER DATA: Protected route
app.get('/api/user/data', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, binderData: user.binderData });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// SAVE USER DATA: Protected route
app.post('/api/user/data', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const { binderData } = req.body;
    
    await db.collection('users').updateOne(
      { _id: new ObjectId(decoded.userId) },
      { 
        $set: { 
          binderData,
          updatedAt: new Date().toISOString()
        } 
      }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Save user data error:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// ── Notebook Management Routes ──────────────────────────────────────────────

// Delete a notebook (and all its sections/pages)
app.delete('/api/notes/notebook/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // ✅ FIX: Use req.params.id (matches the route :id parameter)
    const notebookId = req.params.id;
    
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId) 
    }) as UserDoc | null;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // ✅ FIX: Explicitly type the sections array before using it
    const sections: SectionDoc[] = user.binderData.sections;
    
    const sectionIdsToDelete = sections
      .filter((section) => section.notebookId === notebookId)
      .map((section) => section.id);
    
    // Remove notebook
    await db.collection('users').updateOne(
      { _id: new ObjectId(decoded.userId) },
      { 
        $pull: { 'binderData.notebooks': { id: notebookId } },
        $set: { 'binderData.updatedAt': new Date().toISOString() }
      }
    );
    
    // Remove sections
    if (sectionIdsToDelete.length > 0) {
      await db.collection('users').updateOne(
        { _id: new ObjectId(decoded.userId) },
        { $pull: { 'binderData.sections': { id: { $in: sectionIdsToDelete } } } }
      );
    }
    
    // Remove pages for deleted sections
    const pagesUpdate: Record<string, number> = {};
    sectionIdsToDelete.forEach((sectionId) => {
      pagesUpdate[`binderData.pages.${sectionId}`] = 1;
    });
    
    if (Object.keys(pagesUpdate).length > 0) {
      await db.collection('users').updateOne(
        { _id: new ObjectId(decoded.userId) },
        { $unset: pagesUpdate }
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete notebook error:', error);
    res.status(500).json({ error: 'Failed to delete notebook' });
  }
});

// Delete a section
app.delete('/api/notes/section/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // ✅ FIX: Use req.params.id (matches the route :id parameter)
    const sectionId = req.params.id;
    
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId) 
    }) as UserDoc | null;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // ✅ FIX: Explicitly type the sections array
    const sections: SectionDoc[] = user.binderData.sections;
    
    const section = sections.find((s) => s.id === sectionId);
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    // Remove section
    await db.collection('users').updateOne(
      { _id: new ObjectId(decoded.userId) },
      { 
        $pull: { 'binderData.sections': { id: sectionId } },
        $set: { 'binderData.updatedAt': new Date().toISOString() }
      }
    );
    
    // Remove all pages in this section
    await db.collection('users').updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $unset: { [`binderData.pages.${sectionId}`]: 1 } }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({ error: 'Failed to delete section' });
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