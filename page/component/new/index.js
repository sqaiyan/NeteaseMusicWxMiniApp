var bsurl = require("../../../utils/bsurl.js")
Page({
    data: {
        pt: 1,
        tab: 1,
        tab2: 1,
        songs: [
            {
                name: "ZH",
                img: 'cn',
                loading: true,
                re: []
            }, {
                name: "EA",
                img: 'us',
                loading: true,
                re: []
            },
            {
                name: "KR",
                img: 'kr',
                loading: true,
                re: []
            },
            {
                name: "JP",
                img: 'jp',
                loading: true,
                re: []
            }
        ],
        albums: [
            {
                name: "ZH",
                offset: 0,
                loading: true,
                re: []
            }, {
                name: "EA",
                offset: 0,
                loading: true,
                re: []
            },
            {
                name: "KR",
                offset: 0,
                loading: true,
                re: []
            },
            {
                name: "JP",
                offset: 0,
                loading: true,
                re: []
            }
        ]
    },
    onLoad: function () {
        this.getsongs(this.data.songs[0].name, 0)
    },
    tabtype(e) {
        var i = e.currentTarget.dataset.tab;
        var t = this.data.pt;
        if (t == 1) {
            this.setData({
                tab: i
            })
            i--
            this.data.songs[i].loading && this.getsongs(this.data.songs[i].name, i)
        } else {
            this.setData({
                tab2: i
            })
            i--
            this.data.albums[i].loading && this.getalbums(this.data.albums[i].name, i)
        }

    },
    ptab(e) {
        var i = e.currentTarget.dataset.pt;
        this.setData({
            pt: i
        });
        this.data.albums[0].loading && this.getalbums(this.data.albums[0].name, 0)
    },
    getsongs(type, i) {
        var that = this;
        wx.request({
            url: bsurl + 'top/songs',
            data: { type: type },
            success: function (res) {
                that.data.songs[i].loading = false
                that.data.songs[i].re = res;
                that.setData({
                    songs: that.data.songs
                })
            }
        })
    },
    loadmore() {
        if (this.data.pt == 1) return;
        var i = this.data.tab2 - 1;
        this.data.albums[i].loading && this.getalbums(this.data.albums[i].name, i, 1)
    },
    getalbums(type, i, t) {
        var that = this;
        wx.request({
            url: bsurl + 'top/album',
            data: {
                type: type,
                limit: 20,
                offset: that.data.albums[i].offset
            },
            success: function (res) {
                !res.data.albums.length && (that.data.albums[i].loading = false)
                if (!t) {
                    that.data.albums[i].re = res
                } else {
                    that.data.albums[i].re.data.albums = that.data.albums[i].re.data.albums.concat(res.data.albums);
                }
                that.data.albums[i].offset += res.data.albums.length;
                that.setData({
                    albums: that.data.albums
                })
            }
        })
    }
})