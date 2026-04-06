const { default: prisma } = require('../src/db');
const jwt = require('jsonwebtoken');

// Load env
require('dotenv').config({ path: __dirname + '/../.env' });
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const API = 'http://localhost:5000/api';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

async function runTest() {
  console.log('Testing chat implementation...');
  try {
    // 1. Get a Farmer and a Buyer
    const farmer = await prisma.user.findFirst({ where: { role: 'FARMER' } });
    const buyer = await prisma.user.findFirst({ where: { role: { in: ['BUYER', 'WAREHOUSE'] } } });

    if (!farmer || !buyer) {
      console.log('Need at least one farmer and one buyer/warehouse.');
      return;
    }

    console.log(`Testing with Farmer ${farmer.name} (${farmer.id}) and Buyer ${buyer.name} (${buyer.id})`);

    const farmerToken = signToken({ user_id: farmer.id, role: farmer.role, email: farmer.email });
    const buyerToken = signToken({ user_id: buyer.id, role: buyer.role, email: buyer.email });

    const farmerHeaders = { Authorization: `Bearer ${farmerToken}`, 'Content-Type': 'application/json' };
    const buyerHeaders = { Authorization: `Bearer ${buyerToken}`, 'Content-Type': 'application/json' };

    console.log('\n--- 1. Testing Chat Start ---');
    console.log('Buyer starting chat with Farmer...');
    let chat;
    try {
      const res = await fetch(`${API}/chat/start`, {
          method: 'POST',
          headers: buyerHeaders,
          body: JSON.stringify({ targetUserId: farmer.id })
      });
      if (!res.ok) throw new Error(await res.text());
      chat = await res.json();
      console.log('SUCCESS: Chat opened/created:', chat.id);
    } catch (e) {
      console.error('FAIL: Buyer start chat:', e.message);
      return;
    }

    console.log('\n--- 2. Testing Get Chats ---');
    try {
      const resFarmer = await fetch(`${API}/chat`, { headers: farmerHeaders }).then(r => r.json());
      const resBuyer = await fetch(`${API}/chat`, { headers: buyerHeaders }).then(r => r.json());
      console.log(`SUCCESS: Farmer sees ${resFarmer.length} chats. Buyer sees ${resBuyer.length} chats.`);
      if (!resFarmer.find(c => c.id === chat.id)) {
        console.error('FAIL: Farmer does not see the chat!');
      }
    } catch (e) {
      console.error('FAIL: Get chats:', e.message);
    }
    
    console.log('\n--- 3. Testing Get Messages ---');
    try {
      const resMsgs = await fetch(`${API}/chat/${chat.id}/messages`, { headers: buyerHeaders });
      if (!resMsgs.ok) throw new Error(await resMsgs.text());
      const messages = await resMsgs.json();
      console.log(`SUCCESS: Fetched ${messages.length} messages.`);
    } catch (e) {
      console.error('FAIL: Get messages:', e.message);
    }

    console.log('\n--- 4. Testing Socket Messaging Event ---');
    // We can also insert a message directly via prisma to check schema constraint mapping
    try {
      const message = await prisma.message.create({
        data: {
          chat_id: chat.id,
          sender_id: buyer.id,
          content: 'Test message DB verification'
        }
      });
      console.log('SUCCESS: Sent message directly to DB:', message.id);
    } catch (err) {
      console.error('FAIL: Create message via Prisma:', err);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
runTest();
