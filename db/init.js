const pool = require('./pool');

const SQL = `
-- 用户表：存储用户基本信息与功德数
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  openid        VARCHAR(64) NOT NULL UNIQUE,
  nickname      VARCHAR(100) DEFAULT '',
  avatar_url    TEXT DEFAULT '',
  merit         BIGINT DEFAULT 0,
  current_skin  VARCHAR(32) DEFAULT 'default',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 功德同步日志：记录每次客户端上报的增量
CREATE TABLE IF NOT EXISTS merit_logs (
  id            SERIAL PRIMARY KEY,
  openid        VARCHAR(64) NOT NULL,
  delta         INT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 皮肤配置表
CREATE TABLE IF NOT EXISTS skins (
  id            VARCHAR(32) PRIMARY KEY,
  name          VARCHAR(50) NOT NULL,
  icon_url      TEXT DEFAULT '',
  sound_url     TEXT DEFAULT '',
  sort_order    INT DEFAULT 0
);

-- 索引：按 openid 查用户（登录、同步）
CREATE INDEX IF NOT EXISTS idx_users_openid ON users (openid);

-- 索引：按功德降序（排行榜查询）
CREATE INDEX IF NOT EXISTS idx_users_merit_desc ON users (merit DESC);

-- 索引：按 openid + 时间查同步日志
CREATE INDEX IF NOT EXISTS idx_merit_logs_openid_time ON merit_logs (openid, created_at DESC);

-- 插入默认皮肤数据（幂等）
INSERT INTO skins (id, name, sort_order) VALUES
  ('default',    '经典木鱼',    0),
  ('cyberpunk',  '赛博朋克',    1),
  ('jade',       '翡翠禅心',    2)
ON CONFLICT (id) DO NOTHING;
`;

async function init() {
  console.log('Initializing database...');
  try {
    await pool.query(SQL);
    console.log('Database tables and indexes created successfully.');
  } catch (err) {
    console.error('Database init failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

init();
