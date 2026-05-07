import { MongoClient } from 'mongodb';

async function initReplicaSet() {
  const client = new MongoClient('mongodb://127.0.0.1:27017/admin', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });
  
  try {
    console.log('Connecting to MongoDB at 127.0.0.1:27018...');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const admin = client.db('admin').admin();
    console.log('Initializing ReplicaSet...');
    const result = await admin.command({ replSetInitiate: {} });
    console.log('ReplicaSet initialized:', result);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

initReplicaSet();
