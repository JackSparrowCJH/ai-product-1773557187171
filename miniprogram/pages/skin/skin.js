const app = getApp();

Page({
  data: { skins: [], current: 'default' },
  onLoad() {
    this.setData({ current: wx.getStorageSync('current_skin') || 'default' });
    wx.request({
      url: app.globalData.apiBase + '/skins',
      success: (res) => this.setData({ skins: res.data || [] })
    });
  },
  onSelect(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ current: id });
    wx.setStorageSync('current_skin', id);
    wx.request({
      url: app.globalData.apiBase + '/user/skin',
      method: 'POST',
      data: { openid: app.globalData.openid, skin_id: id }
    });
  }
});
