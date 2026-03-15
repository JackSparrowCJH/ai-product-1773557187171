const app = getApp();

Page({
  data: { list: [] },
  onShow() {
    wx.request({
      url: app.globalData.apiBase + '/rank',
      success: (res) => this.setData({ list: res.data || [] })
    });
  }
});
