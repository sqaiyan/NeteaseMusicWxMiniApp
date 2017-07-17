var bsurl = require('../../../utils/bsurl.js');
var app = getApp();
Page({
	data: {
		art: {},
		loading: false,
		tab: 1,
		curplay: -1,
		album: {
			offset: 0,
			loading: false
		},
		mvs: {
			offset: 0,
			loading: false
		},
		desc: {
			loading: false
		},
		simi: {
			loading: false
		}
	},
	onLoad: function(options) {
		var id = options.id;
		var that = this;
		wx.request({
			url: bsurl + 'artist?id=' + id,
			success: function(res) {
				that.setData({
					art: res.data,
					loading: true
				});
				wx.setNavigationBarTitle({
					title: res.data.artist.name
				})
			}
		})
	},
	playmusic: function(event) {
		
	},
	tabtype: function(e) {
		var t = e.currentTarget.dataset.t;
		this.setData({ tab: t });
		var that = this;
		if(t == 2 && !this.data.album.loading) {
			this.setData({ loading: false })
			wx.request({
				url: bsurl + 'artist/album',
				data: {
					id: that.data.art.artist.id,
					offset: that.data.album.offset,
					limit: 20
				},
				success: function(res) {
					res.data.loading = true;
					res.data.offset = that.data.album.offset + res.data.hotAlbums.length
					that.setData({
						album: res.data,
						loading: true
					})
				}
			})
		}
		if(t == 3 && !this.data.mvs.loading) {
			this.setData({ loading: false })
			wx.request({
				url: bsurl + 'artist/mv',
				data: {
					id: that.data.art.artist.id,
					offset: that.data.mvs.offset,
					limit: 20
				},
				success: function(res) {
					res.data.loading = true;
					res.data.offset = that.data.mvs.offset + res.data.mvs.length
					that.setData({
						mvs: res.data,
						loading: true
					})
				}
			})
		}
		if(t == 4 && !this.data.desc.loading) {
			this.setData({ loading: false })
			wx.request({
				url: bsurl + 'artist/desc',
				data: {
					id: that.data.art.artist.id
				},
				success: function(res) {
					res.data.loading = true;
					that.setData({
						loading: true,
						desc: res.data
					})
				}
			})
			wx.request({
				url: bsurl + 'artist/simi',
				data: {
					id: that.data.art.artist.id,
					cookie: app.globalData.cookie
				},
				success: function(res) {
					if(res.data.code != 200) return
					res.data.loading = true;
					that.setData({
						simi: res.data
					})
				}
			})
		}
	}
})