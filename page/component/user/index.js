var bsurl = require('../../../utils/bsurl.js');
var app = getApp();
Page({
  data: {
    list1: [],
    list2: [],
    user: {},
    id: -1,
    offset: 0,
    more: true,
    loading: true
  },

  onLoad: function (options) {
    var id = options.id
    var that = this;
    wx.request({
      url: bsurl + 'user/detail?uid=' + id,
      success: function (res) {
        that.setData({
          id: id,
          user: res.data
        });
        wx.setNavigationBarTitle({
          title: res.data.profile.nickname
        });
      }
    });
    this.loadplaylist(false, id)
  },
  onReachBottom: function () {
    this.loadplaylist(1)
  },
  loadplaylist: function (isadd, id) {
    var that = this;
    if (!this.data.more || !this.data.loading) { return }
    this.setData({
      loading: true
    })
    wx.request({
      url: bsurl + 'user/playlist',
      data: {
        uid: id || that.data.id,
        offset: that.data.offset,
        limit: 2,
        cookie: app.globalData.cookie
      },
      complete: function (res) {
        var a = res.data.playlist || [];
        var offset = a.length;
        var list1 = a.filter(function (item) { return item.userId == id })
        var list2 = a.filter(function (item) { return item.userId != id })
        if (isadd) {
          offset = that.data.offset + a.length
          list1 = that.data.list1.concat(list1);
          list2 = that.data.list2.concat(list2);
        }
        that.setData({
          loading: false,
          more: res.data.more,
          offset: offset,
          list1: list1,
          list2: list2
        });
      }
    });
  }
});
