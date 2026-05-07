const { MongoClient } = require('mongodb');

async function fix() {
  const urls = [
    'mongodb://127.0.0.1:27017',
    'mongodb://localhost:27017'
  ];

  for (const url of urls) {
    console.log(`Trying to connect to ${url}...`);
    const client = new MongoClient(url, {
      serverSelectionTimeoutMS: 2000,
    });

    try {
      await client.connect();
      console.log('Connected!');
      
      const admin = client.db('admin').admin();
      console.log('Checking replica set status...');
      try {
        const status = await admin.command({ replSetGetStatus: {} });
        console.log('Replica set already initialized:', status.set);
      } catch (e) {
        if (e.message.includes('not yet initialized')) {
          console.log('Initializing replica set...');
          const result = await admin.command({ replSetInitiate: {
            _id: 'rs0',
            members: [{ _id: 0, host: '127.0.0.1:27017' }]
          } });
          console.log('Result:', result);
        } else {
          console.log('Error checking status:', e.message);
        }
      }
      await client.close();
      return;
    } catch (err) {
      console.log(`Failed to connect to ${url}: ${err.message}`);
    }
  }
}

fix();
