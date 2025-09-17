// Simple test script to check if the API is working
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing Smart City API...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE}/`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: Test complaint submission
    console.log('\n2. Testing complaint submission...');
    const testComplaint = {
      name: "Test User",
      age: 25,
      contact: "9876543210",
      email: "test@example.com",
      houseNo: "123",
      street: "Test Street",
      cityRegion: "Gomti Nagar",
      problemRelated: "Water",
      explanation: "This is a test complaint"
    };
    
    const complaintResponse = await axios.post(`${API_BASE}/api/complaints`, testComplaint);
    console.log('✅ Complaint submission passed:', complaintResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
