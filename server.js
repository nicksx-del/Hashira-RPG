const WebSocket = require('ws');

const port = 8080;
const wss = new WebSocket.Server({ port });

// Store connections: campaigns[campId] = { dm: ws, players: { charId: ws } }
const campaigns = {};

console.log(`⚔️ Demon Slayer RPG Server running on port ${port}`);

wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => ws.isAlive = true);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data);
        } catch (e) {
            console.error('Invalid JSON:', e);
        }
    });

    ws.on('close', () => {
        handleDisconnect(ws);
    });
});

function handleMessage(ws, data) {
    const { type, campId, charId, payload } = data;

    if (!campId) return;

    // Initialize campaign room if needed
    if (!campaigns[campId]) {
        campaigns[campId] = { dm: null, players: {} };
    }

    const room = campaigns[campId];

    switch (type) {
        case 'JOIN_DM':
            room.dm = ws;
            ws.role = 'DM';
            ws.campId = campId;
            console.log(`[${campId}] DM Connected`);
            break;

        case 'JOIN_PLAYER':
            if (charId) {
                room.players[charId] = ws;
                ws.role = 'PLAYER';
                ws.campId = campId;
                ws.charId = charId;
                console.log(`[${campId}] Player ${charId} Connected`);
            }
            break;

        case 'UPDATE_PLAYER':
            // DM Sending update for a player
            // Payload should contain { currentHP, maxHP, currentPE... }
            if (ws.role === 'DM') {
                const targetWs = room.players[charId];
                if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                    targetWs.send(JSON.stringify({
                        type: 'SYNC_DATA',
                        payload: payload
                    }));
                    console.log(`[${campId}] DM updated Player ${charId}`);
                }
            } else if (ws.role === 'PLAYER') {
                // Player updating themselves (e.g. spent PE)?
                // Notify DM so DM panel stays in sync
                const dmWs = room.dm;
                if (dmWs && dmWs.readyState === WebSocket.OPEN) {
                    dmWs.send(JSON.stringify({
                        type: 'PLAYER_SYNCED',
                        charId: charId,
                        payload: payload
                    }));
                }
            }
            break;

        case 'PING':
            ws.send(JSON.stringify({ type: 'PONG' }));
            break;
    }
}

function handleDisconnect(ws) {
    if (!ws.campId) return;

    const room = campaigns[ws.campId];
    if (!room) return;

    if (ws.role === 'DM') {
        room.dm = null;
        console.log(`[${ws.campId}] DM Disconnected`);
    } else if (ws.role === 'PLAYER' && ws.charId) {
        delete room.players[ws.charId];
        console.log(`[${ws.campId}] Player ${ws.charId} Disconnected`);
    }
}

// Keep-alive heartbeat
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);
