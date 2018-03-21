var common = require('../../../utils/util.js');
var bsurl = require('../../../utils/bsurl.js');
var app = getApp();
Page({
  data: {
    main: {},
    tab: 0,
    src: "",
    rec: {},
    loading: true,
    offset: 0,
    limit: 20,
    recid: 0,
    loading2:true,
    simi: {},
    id: ""
  },
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: bsurl + 'mv',
      data: {
        id: options.id
      },
      success: function (res) {
        wx.getNetworkType({
          complete: function (r) {
            var src = res.data.data.brs;
            var wifi = r.networkType != 'wifi' ? false : true;
            var url = src[1080] || src[720] || src[480] || src[240]
             url = bsurl + 'mv/url?url=' + url
            that.setData({
              id: options.id,
              main: res.data.data,
              src:url,
              wifi: wifi,
              loading:false,
              recid: res.data.data.commentThreadId
            });
          }
        })

        wx.setNavigationBarTitle({
          title: res.data.data.name
        })
      }
    })
  },
  tab: function (e) {
    var t = e.currentTarget.dataset.tab;
    this.setData({
      tab: t
    });
    var that = this;
    if (this.data.tab == 1 && this.data.rec.code != 200) {
      common.loadrec(app.globalData.cookie, this.data.offset, this.data.limit, this.data.recid, function (data) {
        that.setData({
          loading: false,
          rec: data,
          offset: data.comments.length
        });
      }, 1)
    }
    if (this.data.tab == 2 && this.data.simi.code != 200) {
      that.setData({ loading: true });
      wx.request({
        url: bsurl + 'mv/simi',
        data: { id: that.data.id },
        success: function (res) {
          that.setData({
            loading: false,
            simi: res.data
          });
        }
      })
    }
  },
  loadmore: function () {
    if (this.data.rec.more && !this.data.loading) {
      var that = this;
      this.setData({
        loading2: true
      })
      common.loadrec(app.globalData.cookie, this.data.offset, this.data.limit, this.data.recid, function (data) {
        var rec = that.data.rec;
        var offset = that.data.offset + data.comments.length
        data.comments = rec.comments.concat(data.comments);
        data.hotComments = rec.hotComments;
        that.setData({
          loading2: false,
          rec: data,
          offset: offset
        });
      }, 1)
    }
  }
})