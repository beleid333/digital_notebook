// test-env.ts
import * as dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Checking environment variables...');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI value:', process.env.MONGODB_URI?.substring(0, 30) + '...');