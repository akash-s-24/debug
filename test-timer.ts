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

  const req = await fetch('http://localhost:3000/api/rooms/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config, clientId: 'test-client' })
  });
  const data = await req.json();
  console.log('Create resp:', data);
  if (!data.room) return;
  
  console.log('Created room:', data.room.code, 'timerSeconds:', data.room.config.timerSeconds);

  // Now begin battle
  const beginReq = await fetch('http://localhost:3000/api/battle/begin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId: data.room.id, clientId: 'test-client' })
  });
  const beginData = await beginReq.json();
  console.log('Began battle:', beginData.room?.status, 'startedAt:', beginData.room?.battleStartedAt);

  if (!beginData.room) return;

  // Calculate time remaining like useTimer
  const now = Date.now();
  const battleStartedAt = beginData.room.battleStartedAt;
  const totalPausedMs = beginData.room.totalPausedMs || 0;
  const elapsed = Math.floor((now - battleStartedAt - totalPausedMs) / 1000);
  const timeRemaining = Math.max(0, beginData.room.config.timerSeconds - elapsed);
  
  console.log('Elapsed:', elapsed);
  console.log('Time remaining:', timeRemaining);
}

main().catch(console.error);
