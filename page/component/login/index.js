var bsurl = require('../../../utils/bsurl.js');
var app = getApp();
Page({
    data: {
        phone: "",
        pwd: "",
        linktype: 1,
        url: ''
    },
    onLoad: function (options) {
        //登录成功后跳转类型(1,2,3) navgitorback , redirect ,switchTab
        this.setData({
            linktype: options.t || 3,
            url: options.url || '../home/index'
        })

    },
    textinput: function (event) {
        var type = event.currentTarget.dataset.type;
        if (type == 1) {
            this.setData({
                phone: event.detail.value
            })
        } else {
            this.setData({
                pwd: event.detail.value
            })
        }
    },
    login: function () {
        var that = this;
        var url = /^0\d{2,3}\d{7,8}$|^1[34578]\d{9}$/.test(that.data.phone) ? "login/cellphone" : "login"
        wx.showToast({
            title: '登录中...',
            icon: 'loading'
        })
        wx.request({
            url: bsurl + url,
            data: {
                email: that.data.phone,
                phone: that.data.phone,
                password: that.data.pwd
            },
            complete: function (res) {
                console.log(res);
                wx.hideToast();
                if (res.data.code!=200) {
                    wx.showModal({
                        title: '提示',
                        content: '登录失败，请重试！'
                    })
                    return;
                }
                app.mine();
                app.likelist();
                if (that.data.linktype == 1) {
                    wx.navigateBack({
                        delta: 1
                    })
                }
                else if (that.data.linktype == 2) {
                     wx.redirectTo({
                         url: that.data.url
                     })
                } else {
                    wx.switchTab({
                        url: '../home/index'
                    });
                }

            }
        })
    }
})