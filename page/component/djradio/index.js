var bsurl = require('../../../utils/bsurl.js');
var async = require("../../../utils/async.js")
var nt = require("../../../utils/nt.js");
var common = require('../../../utils/util.js');
var app = getApp();
Page({
    data: {
        djradio: {},
        loading: false,
        programs: {},
        music:{},
        playing:false,
        playtype:1,
        curplay:-1,
        base: {
            id: 0,
            offset: 0,
            limit: 20,
            asc: true
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
			curplay: r.p.id
		})
	},
	music_toggle: function (r) {
		this.setData({
			playing: r.playing
		})
	},
	onHide:function(){
		nt.removeNotification("music_next", this)
        nt.removeNotification("music_toggle", this)
	},
    onShow: function () {
		nt.addNotification("music_next", this.music_next, this);
		nt.addNotification("music_toggle", this.music_toggle, this);
		this.setData({
			curplay: (app.globalData.list_dj[app.globalData.index_dj]||{}).id,
			music: app.globalData.curplay,
			playing: app.globalData.playing,
			playtype: app.globalData.playtype
		})
	},
    onLoad: function (options) {
        var id = options.id;
        var that = this;
        wx.request({
            url: bsurl + 'dj/detail',
            data: {
                id: id,
                cookie: app.globalData.cookie
            },
            complete: function (res) {
                that.setData({
                    djradio: res.data.djRadio
                })
            }
        });
        this.data.base.id = id
        this.setData({
            base: this.data.base
        })
        this.getprograms(false);
    },
    getprograms: function (isadd) {
        var that = this;
        this.setData({ loading: false })
        wx.request({
            url: bsurl + 'dj/program',
            data: {
                id: that.data.base.id,
                offset: that.data.base.offset,
                limit: that.data.base.limit,
                asc: that.data.base.asc
            },
            complete: function (res) {
                if (isadd) {
                    res.data.programs = that.data.programs.programs.concat(res.data.programs);
                }
                that.data.base.offset = (isadd ? that.data.base.offset : 0) + res.data.programs.length
                that.setData({
                    programs: res.data,
                    loading: true,
                    base: that.data.base
                })
            }
        });
    },
    onReachBottom: function () {
        (this.data.programs.more && this.data.loading) && this.getprograms(1);
    },
    djradio_sub: function () {
        var sub = this.data.djradio.subed;
    },
    playmusic: function (event) {
        let that = this;
        let idx = event.currentTarget.dataset.idx;
        var music = that.data.programs.programs[idx];
        app.globalData.curplay = music.mainSong
        app.globalData.list_dj = this.data.programs.programs
        app.globalData.index_dj = idx;
        var shuffle = app.globalData.shuffle;
        app.shuffleplay(shuffle);
        this.setData({
            curplay: music.id
        })
        app.seekmusic(3)
    }
})