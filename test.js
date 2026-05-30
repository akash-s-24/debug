const http = require('http');

async function main() {
  const config = {
    roomName: 'Test',
    hostName: 'TestHost',
    challenge: 'Test',
    timerSeconds: 900,
    language: 'javascript',
    duelType: 'debug-battle',
    maxContestants: 2,
    allowAudience: true,
  };

  const createReq = await fetch('http://localhost:3000/api/rooms/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config, clientId: 'test-client' })
  });
  const data = await createReq.json();
  console.log('Create resp:', JSON.stringify(data, null, 2));
  if (!data.room) return;

  const beginReq = await fetch('http://localhost:3000/api/battle/begin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId: data.room.id, clientId: 'test-client' })
  });
  const beginData = await beginReq.json();
  console.log('Begin resp:', JSON.stringify(beginData, null, 2));
}

main().catch(console.error);
