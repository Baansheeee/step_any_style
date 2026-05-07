const { MongoClient } = require('mongodb');

async function fix() {
  const url = 'mongodb://127.0.0.1:27017/?directConnection=true';
  console.log(`Trying to connect to ${url}...`);
  const client = new MongoClient(url, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log('Connected!');
    
    const admin = client.db('admin').admin();
    console.log('Initializing replica set...');
    try {
      const result = await admin.command({ replSetInitiate: {
        _id: 'rs0',
        members: [{ _id: 0, host: '127.0.0.1:27017' }]
      } });
      console.log('Result:', result);
    } catch (e) {
      console.log('Error initiating:', e.message);
    }
    await client.close();
  } catch (err) {
    console.log(`Failed: ${err.message}`);
  }
}

fix();
