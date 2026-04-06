import prisma from '../src/db';
import { signToken } from '../src/utils/auth';

const API = 'http://localhost:5000/api';

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
    let chat: any;
    try {
      const res = await fetch(`${API}/chat/start`, {
          method: 'POST',
          headers: buyerHeaders,
          body: JSON.stringify({ targetUserId: farmer.id })
      });
      if (!res.ok) throw new Error(await res.text());
      chat = await res.json();
      console.log('SUCCESS: Chat opened/created:', chat.id);
    } catch (e: any) {
      console.error('FAIL: Buyer start chat:', e.message);
      return;
    }

    console.log('\n--- 2. Testing Get Chats ---');
    try {
      const resFarmer: any[] = await fetch(`${API}/chat`, { headers: farmerHeaders }).then(r => r.json());
      const resBuyer: any[] = await fetch(`${API}/chat`, { headers: buyerHeaders }).then(r => r.json());
      console.log(`SUCCESS: Farmer sees ${resFarmer.length} chats. Buyer sees ${resBuyer.length} chats.`);
      if (!resFarmer.find((c: any) => c.id === chat.id)) {
        console.error('FAIL: Farmer does not see the chat!');
      }
    } catch (e: any) {
      console.error('FAIL: Get chats:', e.message);
    }
    
    console.log('\n--- 3. Testing Get Messages ---');
    try {
      const resMsgs = await fetch(`${API}/chat/${chat.id}/messages`, { headers: buyerHeaders });
      if (!resMsgs.ok) throw new Error(await resMsgs.text());
      const messages: any[] = await resMsgs.json();
      console.log(`SUCCESS: Fetched ${messages.length} messages.`);
    } catch (e: any) {
      console.error('FAIL: Get messages:', e.message);
    }

    console.log('\n--- 4. Testing Socket Messaging Event ---');
    const { io } = require('socket.io-client');
    const farmerSocket = io('http://localhost:5000');
    const buyerSocket = io('http://localhost:5000');
    
    buyerSocket.emit('join_chat', chat.id);
    farmerSocket.emit('join_chat', chat.id);

    await new Promise(r => setTimeout(r, 500)); // allow join

    const socketTest = new Promise((resolve) => {
       farmerSocket.on('receive_message', (msg: any) => {
         console.log('SUCCESS: Farmer received message via Socket:', msg.content);
         farmerSocket.disconnect();
         buyerSocket.disconnect();
         resolve(null);
       });

       console.log('Buyer sending socket message...');
       buyerSocket.emit('send_message', {
         chat_id: chat.id,
         sender_id: buyer.id,
         content: 'Hello Farmer from socket test script!',
         image_url: null
       });

       setTimeout(() => {
          console.error('FAIL: Timeout waiting for message via socket');
          farmerSocket.disconnect();
          buyerSocket.disconnect();
          resolve(null);
       }, 3000);
    });

    await socketTest;
    try {
      const message = await prisma.message.create({
        data: {
          chat_id: chat.id,
          sender_id: buyer.id,
          content: 'Test message DB verification'
        }
      });
      console.log('SUCCESS: Sent message directly to DB:', message.id);
    } catch (err: any) {
      console.error('FAIL: Create message via Prisma:', err);
    }

  } catch (err: any) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
runTest();
