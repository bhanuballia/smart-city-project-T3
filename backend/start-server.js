// Simple script to start the server with environment variables
import dotenv from 'dotenv';

// Set default environment variables if .env doesn't exist
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smartcity';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
process.env.PORT = process.env.PORT || '5000';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.OPTIMIZER_URL = process.env.OPTIMIZER_URL || 'http://localhost:8000';

console.log('🚀 Starting Smart City Backend Server...');
console.log('📊 Environment Variables:');
console.log('  - MONGO_URI:', process.env.MONGO_URI);
console.log('  - PORT:', process.env.PORT);
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - OPTIMIZER_URL:', process.env.OPTIMIZER_URL);

// Import and start the server
import('./server.js').catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
