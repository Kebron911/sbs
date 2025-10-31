const { Client } = require('pg');
const fetch = require('node-fetch');

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function main() {
  await client.connect();
  console.log('✅ Connected to PostgreSQL');

  client.on('notification', async (msg) => {
    const channel = msg.channel;
    const payload = JSON.parse(msg.payload);
    
    console.log(`📢 Notification received: ${channel}`);
    
    try {
      const response = await fetch(`${process.env.N8N_WEBHOOK_BASE_URL}/webhook/pg-notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, payload })
      });
      
      if (response.ok) {
        console.log(`✅ Forwarded to n8n: ${channel}`);
      } else {
        console.error(`❌ Failed to forward: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Error forwarding notification:`, error);
    }
  });

  await client.query('LISTEN system_update');
  await client.query('LISTEN unified_event');
  
  console.log('👂 Listening to: system_update, unified_event');
}

main().catch(console.error);