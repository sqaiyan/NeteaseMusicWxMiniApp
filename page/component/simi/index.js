var bsurl = require('../../../utils/bsurl.js');
var async = require("../../../utils/async.js");
var app = getApp();
Page({
  data: {
    loading: false,
    pl: [],
    songs: [],
    user: []
  },
  onLoad: function (options) {
    var id = options.id;
    var that = this;
    async.map(['simi/playlist', 'simi/song', 'simi/user'], function (item, callback) {
      wx.request({
        url: bsurl + item,
        data: { id: id },
        success: function (res) {
          callback(null, res.data)
        }
      })
    }, function (err, results) {
      that.setData({
        loading: true,
        pl: results[0].playlists,
        song: results[1].songs,
        user: results[2].userprofiles
      })
    })
  }
})