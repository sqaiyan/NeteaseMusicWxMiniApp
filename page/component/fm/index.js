var common = require('../../../utils/util.js');
var bsurl = require('../../../utils/bsurl.js');
var nt = require('../../../utils/nt.js');
let app = getApp();
let seek = 0;
Page({
    data: {
        music: {},
        playtime: "00:00",
        duration: "00:00",
        percent: 0,
        downloadPercent: 0,
        imgload: false,
        playing: true,
        showlrc: false,
        commentscount: 0,
        lrc: {},
        stared: false
    },
    music_next: function (r) {
        var that = this
        console.log("playing next")
        common.loadrec(app.globalData.cookie, 0, 0, r.music.id, function (res) {
            that.setData({
                commentscount: res.total
            })
        })
    },
    onLoad: function (options) {
        var that = this;
        var music = app.globalData.list_fm[app.globalData.index_fm];
        var that = this;
        if (music && app.globalData.playtype == 2) {
            this.setData({
                music: music,
                duration: common.formatduration(music.duration),
            });
            common.loadrec(app.globalData.cookie, 0, 0, that.data.music.id, function (res) {
                that.setData({
                    commentscount: res.total
                })
            })
        } else {
            app.nextfm();
        }
    },
    onShareAppMessage: function () {
        return {
            title: this.data.music.name,
            desc: this.data.music.artists[0].name,
            path: 'page/component/home/index?share=1&st=playing&id=' + this.data.music.id
        }
    },
    loadlrc: function () {
        common.loadlrc(this);
    },
    onShow: function () {
        var that = this;
        nt.addNotification("music_next", this.music_next, this);
        if (app.globalData.playtype != 2) {
            app.nextfm();
        };
        common.playAlrc(that, app);
        seek = setInterval(function () {
            common.playAlrc(that, app);
        }, 1000);
    },
    onHide: function () {
        clearInterval(seek)
        nt.removeNotification("music_next", this)
    },
    onUnload:function(){
        nt.removeNotification("music_next", this)
    },
    songheart: function (e) {
        common.songheart(this,app, 0, this.data.music.starred)
    },
    trash: function () {
        var that = this;
        common.songheart(this,app, 1)
    },
    loadimg: function (e) {
        this.setData({
            imgload: true
        })
    },
    museek: function (e) {
        var nextime = e.detail.value
        var that = this;
        nextime = app.globalData.curplay.duration * nextime / 100000;
        app.globalData.currentPosition = nextime
        app.seekmusic(2,app.globalData.currentPosition, function () {
            that.setData({
                percent: e.detail.value
            })
        });
    },
    play: function (m) {
      console.log('fm play')
        common.toggleplay(this, app, function () { })
    },
    nextplay: function () {
        this.setData({
            lrc: [],
            playtime: '00:00',
            percent: '0',
            playing: false,
            showlrc: false,
            duration: "00:00"
        })
        app.nextfm();
    }
})