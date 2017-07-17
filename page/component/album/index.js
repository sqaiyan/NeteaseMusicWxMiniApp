var app = getApp();
var bsurl = require('../../../utils/bsurl.js');
var common = require('../../../utils/util.js');
var nt = require("../../../utils/nt.js");
Page({
  data: {
    result: {},
    curplay: 0,
    music: {},
    playing: false,
    playtype: 1,
    loading: true,
    music: {},
    playing: false,
    playtype: 1,
    share: {
      title: "一起来听",
      des: ""
    }
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
      url: bsurl + 'album/detail',
      data: {
        id: options.pid
      },
      success: function (res) {
        var re = res.data;
        re.album.publishTime = common.formatTime(re.album.publishTime, 3);
        var canplay = [];
        for (var i = 0; i < res.data.songs.length; i++) {
          var r = res.data.songs[i]
          if (r.privilege.st > -1) {
            canplay.push(r)
          }
        }
        that.setData({
          result: res.data,
          loading: false,
          canplay: canplay,
          share: {
            id: options.id,
            title: res.data.album.name + '-' + res.data.album.artist.name,
            des: res.data.album.description
          }
        });
        wx.setNavigationBarTitle({
          title: res.data.album.name
        })
      },
      fail: function (res) {
        wx.navigateBack({
          delta: 1
        })
      }
    });
  },
  onShareAppMessage: function () {
    if (this.data.share.id) return;
    return {
      title: this.data.share.title,
      desc: this.data.share.des,
      path: 'page/component/playing/index?id=' + this.data.share.id
    }
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
  artlist: function (e) {
    var userid = e.currentTarget.dataset.userid;
    wx.redirectTo({
      url: '../artist/index?id=' + userid
    })
  },
  playall: function (event) {
    this.setplaylist(this.data.canplay[0], 0);
    app.seekmusic(1)

  },
  setplaylist: function (music, index) {
    //设置播放列表，设置当前播放音乐，设置当前音乐在列表中位置
    app.globalData.curplay = app.globalData.curplay.id != music.id ? music : app.globalData.curplay;
    app.globalData.index_am = index; //event.currentTarget.dataset.idx;
    app.globalData.playtype = 1;
    var shuffle = app.globalData.shuffle;
    app.globalData.list_sf = this.data.canplay; //this.data.list.tracks;
    app.shuffleplay(shuffle);
    app.globalData.globalStop = false;
  },
  mv: function (e) {
    var id = e.currentTarget.dataset.mvid;
    wx.navigateTo({
      url: '../mv/index?id=' + id
    })
  },
  playmusic: function (event) {
    var that = this;
    var music = event.currentTarget.dataset.idx;
    var st = event.currentTarget.dataset.st;
    if (st * 1 < 0) {
      wx.showToast({
        title: '歌曲已下架',
        icon: 'success',
        duration: 2000
      });
      return;
    }
    music = this.data.result.songs[music];
    that.setplaylist(music, event.currentTarget.dataset.idx)
  }
});