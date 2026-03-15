const express = require('express');
const pool = require('./db/pool');
require('dotenv').config();

const app = express();
app.use(express.json());

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW() AS time');
    res.json({ status: 'ok', time: rows[0].time });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 用户登录/注册（小程序端传 openid）
app.post('/api/user/login', async (req, res) => {
  const { openid, nickname, avatar_url } = req.body;
  if (!openid) return res.status(400).json({ error: 'openid required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (openid, nickname, avatar_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (openid) DO UPDATE SET
         nickname = COALESCE(NULLIF($2, ''), users.nickname),
         avatar_url = COALESCE(NULLIF($3, ''), users.avatar_url),
         updated_at = NOW()
       RETURNING id, openid, nickname, avatar_url, merit, current_skin`,
      [openid, nickname || '', avatar_url || '']
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 功德同步：客户端上报增量
app.post('/api/merit/sync', async (req, res) => {
  const { openid, delta } = req.body;
  if (!openid || !delta || delta < 1) {
    return res.status(400).json({ error: 'openid and positive delta required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO merit_logs (openid, delta) VALUES ($1, $2)',
      [openid, delta]
    );
    const { rows } = await client.query(
      `UPDATE users SET merit = merit + $2, updated_at = NOW()
       WHERE openid = $1 RETURNING merit`,
      [openid, delta]
    );
    await client.query('COMMIT');
    res.json({ merit: rows[0]?.merit ?? 0 });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 排行榜：取前 50
app.get('/api/rank', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT openid, nickname, avatar_url, merit
       FROM users ORDER BY merit DESC LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 皮肤列表
app.get('/api/skins', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM skins ORDER BY sort_order'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 切换皮肤
app.post('/api/user/skin', async (req, res) => {
  const { openid, skin_id } = req.body;
  if (!openid || !skin_id) return res.status(400).json({ error: 'openid and skin_id required' });

  try {
    const { rows } = await pool.query(
      `UPDATE users SET current_skin = $2, updated_at = NOW()
       WHERE openid = $1 RETURNING current_skin`,
      [openid, skin_id]
    );
    res.json({ current_skin: rows[0]?.current_skin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
