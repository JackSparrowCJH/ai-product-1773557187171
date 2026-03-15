const app = getApp();

Page({
  data: {
    merit: 0,
    combo: 0,
    tapAnim: false,
    showFloat: false,
    floatX: 150,
    floatY: 150
  },

  comboTimer: null,
  pendingDelta: 0,
  syncTimer: null,

  onLoad() {
    const local = wx.getStorageSync('merit') || 0;
    this.setData({ merit: local });
  },

  onTapFish(e) {
    const merit = this.data.merit + 1;
    const combo = this.data.combo + 1;
    this.pendingDelta++;

    this.setData({ merit, combo, tapAnim: true, showFloat: true, floatX: 120 + Math.random()*60, floatY: 100 + Math.random()*60 });
    wx.vibrateShort({ type: 'light' });

    setTimeout(() => this.setData({ tapAnim: false }), 80);
    setTimeout(() => this.setData({ showFloat: false }), 600);

    // 连击重置计时
    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => this.setData({ combo: 0 }), 1000);

    // 本地持久化
    wx.setStorageSync('merit', merit);

    // 批量同步：每3秒上报一次
    if (!this.syncTimer) {
      this.syncTimer = setTimeout(() => this.syncMerit(), 3000);
    }
  },

  syncMerit() {
    const delta = this.pendingDelta;
    if (delta <= 0) { this.syncTimer = null; return; }
    this.pendingDelta = 0;
    this.syncTimer = null;

    wx.request({
      url: app.globalData.apiBase + '/merit/sync',
      method: 'POST',
      data: { openid: app.globalData.openid, delta }
    });
  },

  onShareAppMessage() {
    return {
      title: `我已积累${this.data.merit}功德，来敲木鱼！`,
      path: '/pages/index/index'
    };
  }
});
