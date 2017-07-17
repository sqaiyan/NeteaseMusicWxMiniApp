var common = require('../../../utils/util.js');
var bsurl = require('../../../utils/bsurl.js');
var nt = require('../../../utils/nt.js');
let app = getApp();
let seek = 0;
let defaultdata = {
  playing: false,
  music: {},
  playtime: '00:00',
  duration: '00:00',
  percent: 0,
  lrc: [],
  commentscount: 0,
  lrcindex: 0,
  showlrc: false,
  disable: false,
  downloadPercent: 0,
  showminfo: false,
  showpinfo: false,
  showainfo: false,
  playlist: [],
  curpl: [],
  share: {
    title: "",
    des: ""
  }
};

Page({
  data: defaultdata,
  onShareAppMessage: function () {
    return {
      title: this.data.share.title,
      desc: this.data.share.des,
      path: 'page/component/home/index?share=1&st=playing&id=' + this.data.share.id + '&br=' + this.data.share.br
    }
  },
  playmusic: function (that, id, br) {
    wx.request({
      url: bsurl + 'music/detail',
      data: {
        id: id
      },
      success: function (res) {
        app.globalData.curplay = res.data.songs[0];
        !app.globalData.list_am.length && (app.globalData.list_am.push(res.data.songs[0]))
        !app.globalData.list_sf.length && (app.globalData.list_sf.push(res.data.songs[0]))
        app.globalData.curplay.st = app.globalData.staredlist.indexOf(app.globalData.curplay.id) < 0 ? false : true
        that.setData({
          start: 0,
          share: {
            id: id,
            title: app.globalData.curplay.name,
            br: res.data.privileges[0].maxbr,
            des: (app.globalData.curplay.ar || app.globalData.curplay.artists)[0].name
          },
          music: app.globalData.curplay,
          duration: common.formatduration(app.globalData.curplay.dt || app.globalData.curplay.duration)
        });
        wx.setNavigationBarTitle({ title: app.globalData.curplay.name });
        app.seekmusic(1);
        common.loadrec(app.globalData.cookie, 0, 0, that.data.music.id, function (res) {
          that.setData({
            commentscount: res.total
          })
        })
      }
    })

  },
  loadlrc: function () {
    common.loadlrc(this);
  },
  togminfo: function () {
    this.setData({
      showainfo: false,
      showpinfo: false,
      showminfo: !this.data.showminfo
    })
  },
  togpinfo: function () {
    this.setData({
      showminfo: false,
      showainfo: false,
      showpinfo: !this.data.showpinfo
    })
  },

  togainfo: function () {
    this.setData({
      showminfo: false,
      showpinfo: false,
      showainfo: !this.data.showainfo
    })
  },
  playother: function (e) {
    var type = e.currentTarget.dataset.other;
    //this.setData(defaultdata);
    var that = this;
    app.nextplay(type, function () {
      that.setData({
        share: {
          id: app.globalData.curplay.id,
          title: app.globalData.curplay.name,
          des: (app.globalData.curplay.ar || app.globalData.curplay.artists)[0].name
        }
      })
    });
  },
  playshuffle: function () {
    var shuffle = this.data.shuffle;
    shuffle++;
    shuffle = shuffle > 3 ? 1 : shuffle;
    this.setData({
      shuffle: shuffle
    })
    var msg = "";
    switch (shuffle) {
      case 1:
        msg = "顺序播放";
        break;
      case 2:
        msg = "单曲播放";
        break;
      case 3:
        msg = "随机播放"
    }
    wx.showToast({
      title: msg,
      duration: 2000
    })
    app.shuffleplay(shuffle);
  },
  songheart: function () {
    common.songheart(this, app, 0, this.data.music.st)
  },
  pospl:function(e){
    //播放列表中单曲播放
    var i=e.currentTarget.dataset.index;
    app.nextplay(1,function(){},i)
  },
  del_curpl:function(e){
    //播放列表中单曲删除
    var i=e.currentTarget.dataset.index;
    app.globalData.list_sf.splice(i,1);
    app.globalData.list_am=app.globalData.list_sf;
    app.globalData.index_am=app.globalData.index_am>i?(app.globalData.index_am-1):app.globalData.index_am;
    this.setData({
      curpl:app.globalData.list_am
    })
  },
  del_all:function(){
    app.globalData.list_am=app.globalData.list_sf=[];
    app.globalData.index_am=0
    this.setData({
      curpl:[]
    })
  },
  museek: function (e) {
    //歌曲定位播放
    var nextime = e.detail.value
    var that = this
    nextime = app.globalData.curplay.dt * nextime / 100000;
    app.globalData.currentPosition = nextime
    app.seekmusic(1, app.globalData.currentPosition, function () {
      that.setData({
        percent: e.detail.value
      })
    });
  },
  onShow: function () {
    var that = this;
    app.globalData.playtype = 1;
    nt.addNotification("music_next", this.music_next, this);
    common.playAlrc(that, app);
    seek = setInterval(function () {
      common.playAlrc(that, app);
    }, 1000);
  },
  onUnload: function () {
    clearInterval(seek);
    nt.removeNotification("music_next", this)
  },
  onHide: function () {
    clearInterval(seek)
    nt.removeNotification("music_next", this)
  },
  music_next: function (r) {
    var that = this
    common.loadrec(app.globalData.cookie, 0, 0, r.music.id, function (res) {
      that.setData({
        commentscount: res.total
      })
    })
  },
  onLoad: function (options) {
    var that = this;
    this.setData({
      curpl: app.globalData.list_am,
      shuffle: app.globalData.shuffle
    });
    if (app.globalData.curplay.id != options.id || !app.globalData.curplay.url) {
      //播放不在列表中的单曲
      this.playmusic(that, options.id, options.br);
    } else {
      that.setData({
        start: 0,
        music: app.globalData.curplay,
        duration: common.formatduration(app.globalData.curplay.dt || app.globalData.curplay.duration),
        share: {
          id: app.globalData.curplay.id,
          br: options.br,
          title: app.globalData.curplay.name,
          des: (app.globalData.curplay.ar || app.globalData.curplay.artists)[0].name
        },
      });
      wx.setNavigationBarTitle({ title: app.globalData.curplay.name });
      common.loadrec(app.globalData.cookie, 0, 0, that.data.music.id, function (res) {
        that.setData({
          commentscount: res.total
        })
      })
    };
    var id = wx.getStorageSync('user');
    id = id.account.id;
    wx.request({
      url: bsurl + 'user/playlist',
      data: {
        uid: id,
        offset: 0,
        limit: 1000
      },
      success: function (res) {
        that.setData({
          playlist: res.data.playlist.filter(function (item) { return item.userId == id })
        });
      }
    });
  },
  trackstpl: function (e) {
    var pid = e.currentTarget.dataset.pid;
    var that = this;
    wx.showToast({
      title: "请稍后",
      icon: "loading",
      mask: true
    })
    wx.request({
      url: bsurl + 'playlist/tracks',
      data: {
        op: 'add',
        pid: pid,
        tracks: this.data.music.id,
        cookie: app.globalData.cookie
      },
      success: function (res) {
        wx.hideToast();
        if (res.data.code == 200) {
          wx.showToast({
            title: "已添加至歌单！",
            duration: 1000
          });
          var pl = that.data.playlist.map(function (i) {
            if (i.id == pid) {
              i.trackCount = res.data.count;
            }
            return i
          })

          that.setData({
            playlist: pl
          })
        }
        else if (res.data.code == 301) {
          wx.navigateTo({
            url: '../login/index?t=1'
          })
        }
        else {
          wx.showToast({
            title: res.data.code == 502 ? "歌曲已存在" : "添加失败，请稍后再试！",
            duration: 1000
          })
        }
      }
    })
  },
  playingtoggle: function (event) {
    common.toggleplay(this, app, function () { })
  }
})