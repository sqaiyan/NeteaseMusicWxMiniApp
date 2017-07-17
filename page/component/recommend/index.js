var app = getApp();
var bsurl=require('../../../utils/bsurl.js');
var common = require('../../../utils/util.js');
Page({
    data: {
        rec: {},
        main: {},
        loading: true,
        limit: 20,
        offset: 0,
        recid: 0,
    },
    onLoad: function (options) {
        var id = options.id,
            fromtype = options.from,
            that = this;
        this.setData({
            recid: id,
            loading: true,
        });
        var type=(fromtype=='song')?'':1;
        common.loadrec(app.globalData.cookie,this.data.offset, this.data.limit, id, function (data) {
            that.setData({
                loading: false,
                rec: data,
                loading: false,
                type:type,
                offset: data.comments?data.comments.length:0
            });
            wx.setNavigationBarTitle({
                title: '评论(' + (data.total||0) + ")"
            })
        },type)
    },
    onPullDownRefresh:function(){
        wx.stopPullDownRefresh();
    },
    onReachBottom: function () {
        if (this.data.rec.more&&!this.data.loading) {
            var that = this;
            this.setData({
                loading:true
            })
            common.loadrec(app.globalData.cookie,this.data.offset, this.data.limit, this.data.recid, function (data) {
                var rec = that.data.rec;
                var offset = that.data.offset + (data.comments||[]).length
                data.comments = rec.comments.concat(data.comments);
                data.hotComments=rec.hotComments;
                that.setData({
                    loading: false,
                    rec: data,
                    loading: false,
                    offset: offset
                });
            },this.data.type)
        }
    }

})