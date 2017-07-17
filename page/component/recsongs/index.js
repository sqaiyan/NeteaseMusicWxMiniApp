var bsurl = require('../../../utils/bsurl.js');
var nt = require("../../../utils/nt.js")
var common = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    list: [],
    curplay: -1,
    music: {},
    playing: false,
    playtype: 1,
    date: ((new Date()).getDate())
  },
  toggleplay: function () {
    common.toggleplay(this, app);
  },
  playnext: function (e) {
    app.nextplay(e.currentTarget.dataset.pt)
  },
  music_next: function (r) {
    this.setData({
      music: r.music,
      playtype: r.playtype,
      curplay: r.music.id
    })
  },
  music_toggle: function (r) {
    this.setData({
      playing: r.playing,
      music: r.music,
      playtype: r.playtype,
      curplay: r.music.id
    })
  },
  onShow: function () {
    nt.addNotification("music_next", this.music_next, this);
    nt.addNotification("music_toggle", this.music_toggle, this);
    this.setData({
      curplay: app.globalData.curplay.id,
      music: app.globalData.curplay,
      playing: app.globalData.playing,
      playtype: app.globalData.playtype
    })
  },
  onHide: function () {
    nt.removeNotification("music_next", this)
    nt.removeNotification("music_toggle", this)
  },
  lovesong: function () {
    common.songheart(this, app, 0, (this.data.playtype == 1 ? this.data.music.st : this.data.music.starred));
  },
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: bsurl + 'recommend/songs',
      success: function (res) {
        that.setData({
          songs: res.data.recommend,
          loading: true
        })
      }
    })
  },
  playall: function (event) {
    this.setplaylist(this.data.songs[0], 0);
    app.seekmusic(1)
  },
  setplaylist: function (music, index) {
    //设置播放列表，设置当前播放音乐，设置当前音乐在列表中位置
    app.globalData.curplay = app.globalData.curplay.id != music.id ? music : app.globalData.curplay;
    app.globalData.index_am = index;
    app.globalData.playtype = 1;
    var shuffle = app.globalData.shuffle;
    app.globalData.list_sf = this.data.songs;//this.data.list.tracks;
    app.shuffleplay(shuffle);
    app.globalData.globalStop = false;
    this.setData({
      curplay: music.id
    })
  },
  playmusic: function (event) {
    var that = this;
    let music = event.currentTarget.dataset.idx;
    let st = event.currentTarget.dataset.st;
    if (st * 1 < 0) {
      wx.showToast({
        title: '歌曲已下架',
        icon: 'success',
        duration: 2000
      });
      return;
    }
    music = this.data.songs[music];
    that.setplaylist(music, event.currentTarget.dataset.idx);
  }
})