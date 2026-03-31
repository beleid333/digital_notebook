// test-db.ts
import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// 1. Read MongoDB URI from environment variables
// We use process.env to keep secrets out of code
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Error: MONGODB_URI is not defined in environment variables.');
  console.error('💡 Please create a .env file and add your connection string.');
  process.exit(1);
}

// Create a new MongoClient instance
const client = new MongoClient(uri);

// Define database and collection names
const dbName = 'digital_binder';
const collectionName = 'notes';

async function run() {
  try {
    // 2. Connect to MongoDB Atlas
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');

    const database = client.db(dbName);
    const notes = database.collection(collectionName);

    // 3. Insert 10 realistic documents (Digital Binder Notes)
    // We generate different timestamps to simulate notes created over time
    console.log(`\n📝 Inserting 10 sample notes into '${collectionName}'...`);
    
    const now = Date.now();
    const sampleNotes = Array.from({ length: 10 }, (_, i) => ({
      title: `Note ${i + 1}: ${['Meeting', 'Idea', 'Task', 'Research'][i % 4]}`,
      content: `This is the content for note ${i + 1}. It contains important information about the project.`,
      notebook: ['Projects', 'Personal', 'Ideas', 'Research'][i % 4],
      createdAt: new Date(now - i * 1000000).toISOString(), // Different times
      updatedAt: new Date(now - i * 1000000).toISOString(),
      tags: ['important', 'work', 'personal'].slice(0, (i % 3) + 1)
    }));

    const insertResult = await notes.insertMany(sampleNotes);
    console.log(`✅ Inserted ${insertResult.insertedCount} documents.`);

    // 4. Read and print the 5 most recent documents
    console.log('\n Fetching 5 most recent notes...');
    const recentNotes = await notes
      .find()
      .sort({ createdAt: -1 }) // Sort by timestamp descending
      .limit(5)
      .toArray();
    
    console.log('📋 Recent Notes:');
    recentNotes.forEach(note => {
      console.log(`   - ${note.title} (${note.createdAt})`);
    });

    // 5. Read and print one full document by _id
    if (insertResult.insertedIds[0]) {
      const firstId = insertResult.insertedIds[0];
      console.log(`\n🔍 Fetching specific note by ID: ${firstId}...`);
      const specificNote = await notes.findOne({ _id: firstId });
      console.log('📄 Full Document:', JSON.stringify(specificNote, null, 2));
    }

  } catch (error) {
    // 6. Simple error handling
    console.error('❌ An error occurred:', error);
  } finally {
    // 7. Close the MongoDB connection
    await client.close();
    console.log('\n🔌 Connection closed.');
  }
}

// Execute the function
run().catch(console.dir);