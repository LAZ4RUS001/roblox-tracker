const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// เก็บสถานะใน memory
const activeSessions = new Map();
const uniqueUsers = new Set();

// Endpoint รับ heartbeat จาก Roblox Script
app.post("/api/ping", (req, res) => {
    const { userId, username, executor, gameName } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const now = Date.now();
    uniqueUsers.add(userId);
    activeSessions.set(userId, {
        username: username || "Unknown",
        executor: executor || "Unknown",
        gameName: gameName || "Unknown",
        lastSeen: now
    });

    res.json({ success: true });
});

// Endpoint สำหรับเปิดดู Dashboard ในเบราว์เซอร์
app.get("/", (req, res) => {
    const now = Date.now();
    // ตัดคนที่ขาดการส่งสัญญาณเกิน 90 วินาทีออก (ถือว่าออฟไลน์)
    for (const [id, user] of activeSessions.entries()) {
        if (now - user.lastSeen > 90000) {
            activeSessions.delete(id);
        }
    }

    const onlineList = Array.from(activeSessions.values());
    
    // แสดงผลหน้าเว็บแบบเรียบง่าย
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Hub Analytics</title>
            <meta http-equiv="refresh" content="10">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; margin: 0; }
                .container { max-width: 900px; margin: 0 auto; }
                .card { background: #1e293b; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .stats-grid { display: flex; gap: 20px; }
                .stat-box { flex: 1; background: #0f172a; padding: 15px; border-radius: 8px; border-left: 4px solid #38bdf8; }
                .count { font-size: 32px; font-weight: bold; color: #38bdf8; margin-top: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #334155; padding: 10px 12px; text-align: left; }
                th { background: #334155; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
                tr:nth-child(even) { background: #172033; }
                .badge { background: #0284c7; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
                .empty { text-align: center; color: #64748b; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Script Hub Live Tracker</h1>
                <div class="card">
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div>Online Right Now</div>
                            <div class="count">${onlineList.length}</div>
                        </div>
                        <div class="stat-box" style="border-left-color: #a855f7;">
                            <div>Total Unique Users</div>
                            <div class="count" style="color: #a855f7;">${uniqueUsers.size}</div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <h2>Active Users (${onlineList.length})</h2>
                    <table>
                        <tr>
                            <th>Username</th>
                            <th>Executor</th>
                            <th>Game</th>
                            <th>Last Active</th>
                        </tr>
                        ${onlineList.length === 0 ? '<tr><td colspan="4" class="empty">ไม่มีผู้ใช้ออนไลน์ในขณะนี้</td></tr>' : onlineList.map(u => `
                            <tr>
                                <td><strong>${u.username}</strong></td>
                                <td><span class="badge">${u.executor}</span></td>
                                <td>${u.gameName}</td>
                                <td>${Math.round((now - u.lastSeen) / 1000)} วินาทีที่แล้ว</td>
                            </tr>
                        `).join("")}
                    </table>
                </div>
            </div>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Tracker running on port " + PORT));
