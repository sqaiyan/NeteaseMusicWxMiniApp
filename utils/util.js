var bsurl = require('bsurl.js');
function formatTime(date, type) {
  type = type || 1;
  //type 1,完成输出年月日时分秒，2对比当前时间输出日期，或时分;
  var d = new Date(date)
  var year = d.getFullYear()
  var month = d.getMonth() + 1
  var day = d.getDate()
  var hour = d.getHours()
  var minute = d.getMinutes()
  var second = d.getSeconds();
  if (type == 1) {
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
  }
  else if (type == 3) {
    return [year, month, day].map(formatNumber).join('-');
  } else {
    var jm = new Date
      , Fo = jm.getTime() - date;
    if (Fo <= 6e4)
      return "刚刚";
    var Qq = jm.getHours() * 36e5 + jm.getMinutes() * 6e4 + jm.getSeconds() * 1e3;
    if (day==jm.getDate()) {
      if (Fo < 36e5) {
        var bOh = Math.floor(Fo / 6e4);
        return bOh + "分钟前"
      }
      return [hour, minute].map(formatNumber).join(':');
    } else {
      if (Fo < Qq + 864e5) {
        return "昨天" + [hour, minute].map(formatNumber).join(':');
      } else {
        var hq = jm.getFullYear()
          , bOg = new Date(hq, 0, 1);
        var Qq = jm.getTime() - bOg.getTime();
        if (Fo < Qq) {
          return year + "年" + month + "月" + day + "日" + [hour, minute].map(formatNumber).join(':');
        }
        return year + "年" + month + "月" + day + "日"
      }
    }
  }
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function formatduration(duration) {
  duration = new Date(duration);
  return formatNumber(duration.getMinutes()) + ":" + formatNumber(duration.getSeconds());
}
//转换歌词字符串为数组
function parse_lrc(lrc_content) {
  let now_lrc = [];
  let lrc_row = lrc_content.split("\n");
  let scroll = true;
  for (let i in lrc_row) {
    if ((lrc_row[i].indexOf(']') == -1) && lrc_row[i]) {
      now_lrc.push({ lrc: lrc_row[i] });
    } else if (lrc_row[i] != "") {
      var tmp = lrc_row[i].split("]");
      for (let j in tmp) {
        scroll = false
        let tmp2 = tmp[j].substr(1, 8);
        tmp2 = tmp2.split(":");
        let lrc_sec = parseInt(tmp2[0] * 60 + tmp2[1] * 1);
        if (lrc_sec && (lrc_sec > 0)) {
          let lrc = (tmp[tmp.length - 1]).replace(/(^\s*)|(\s*$)/g, "");
          lrc && now_lrc.push({ lrc_sec: lrc_sec, lrc: lrc });
        }
      }
    }
  }
  if (!scroll) {
    now_lrc.sort(function (a, b) {
      return a.lrc_sec - b.lrc_sec;
    });
  }
  return {
    now_lrc: now_lrc,
    scroll: scroll
  };
}
//音乐播放监听
function playAlrc(that, app) {
  if (app.globalData.globalStop) {
    that.setData({
      playtime: '00:00',
      duration: '00:00',
      percent: 0.1,
      playing: false,
      downloadPercent: 0
    });
    return;
  }
  if (that.data.music.id != app.globalData.curplay.id) {
    that.setData({
      music: app.globalData.curplay,
      lrc: [],
      showlrc: false,
      lrcindex: 0,
      duration: formatduration(app.globalData.curplay.duration || app.globalData.curplay.dt)
    });
    wx.setNavigationBarTitle({ title: app.globalData.curplay.name });
  }
  wx.getBackgroundAudioPlayerState({
    complete: function (res) {
      var time = 0, lrcindex = that.data.lrcindex, playing = false, playtime = 0, downloadPercent = 0;
      if (res.status != 2) {
        time = res.currentPosition / res.duration * 100;
        playtime = res.currentPosition;
        downloadPercent = res.downloadPercent
        if (that.data.showlrc && !that.data.lrc.scroll) {
          for (let i in that.data.lrc.lrc) {
            var se = that.data.lrc.lrc[i];
            if (se.lrc_sec <= res.currentPosition) {
              lrcindex = i
            }
          }
        };

      } if (res.status == 1) {
        playing = true;
      }
      app.globalData.play = playing;
      that.setData({
        playtime: formatduration(playtime * 1000),
        percent: time,
        playing: playing,
        lrcindex: lrcindex,
        downloadPercent: downloadPercent
      })
    }
  });
};
//加载评论1为单曲，2歌单类，3专辑,
function loadrec(cookie, offset, limit, id, cb, type) {
  wx.request({
    url: bsurl + 'comments',
    data: {
      id: (type == 1 ? '' : (type == 3 ? 'A_DJ_1_' : 'R_SO_4_')) + id,
      limit: limit,
      offset: offset,
      cookie: cookie
    },
    success: function (res) {
      var data = res.data;
      for (let i in data.hotComments) {
        data.hotComments[i].time = formatTime(data.hotComments[i].time, 2);
        data.hotComments[i].content = emoji(data.hotComments[i].content)
        if (data.hotComments[i].beReplied[0]) {
          data.hotComments[i].beReplied[0].content = emoji(data.hotComments[i].beReplied[0].content)
        }
      }
      for (let i in data.comments) {
        data.comments[i].time = formatTime(data.comments[i].time, 2);
        data.comments[i].content = emoji(data.comments[i].content)
        if (data.comments[i].beReplied[0]) {
          data.comments[i].beReplied[0].content = emoji(data.comments[i].beReplied[0].content)
        }
      };
      cb && cb(data)
    }
  })
}
//评论内容emoji表情转换
function emoji(str) {
  if (!str) return;
  var bl = {
    "大笑": "86",
    "可爱": "85",
    "憨笑": "359",
    "色": "95",
    "亲亲": "363",
    "惊恐": "96",
    "流泪": "356",
    "亲": "362",
    "呆": "352",
    "哀伤": "342",
    "呲牙": "343",
    "吐舌": "348",
    "撇嘴": "353",
    "怒": "361",
    "奸笑": "341",
    "汗": "97",
    "痛苦": "346",
    "惶恐": "354",
    "生病": "350",
    "口罩": "351",
    "大哭": "357",
    "晕": "355",
    "发怒": "115",
    "开心": "360",
    "鬼脸": "94",
    "皱眉": "87",
    "流感": "358",
    "爱心": "33",
    "心碎": "34",
    "钟情": "303",
    "星星": "309",
    "生气": "314",
    "便便": "89",
    "强": "13",
    "弱": "372",
    "拜": "14",
    "牵手": "379",
    "跳舞": "380",
    "禁止": "374",
    "这边": "262",
    "爱意": "106",
    "示爱": "376",
    "嘴唇": "367",
    "狗": "81",
    "猫": "78",
    "猪": "100",
    "兔子": "459",
    "小鸡": "450",
    "公鸡": "461",
    "幽灵": "116",
    "圣诞": "411",
    "外星": "101",
    "钻石": "52",
    "礼物": "107",
    "男孩": "0",
    "女孩": "1",
    "蛋糕": "337",
    18: "186",
    "圈": "312",
    "叉": "313"
  }
  var emojiObjs = [];
  str = str.replace(/\[([^\[\]]+)\]/g, ':$1:')
  var eReg = new RegExp("[:]");
  var array = str.split(eReg);
  for (var i = 0; i < array.length; i++) {
    var ele = array[i];
    var emojiObj = {};
    if (bl[ele]) {
      emojiObj.node = "element";
      emojiObj.tag = "emoji";
      emojiObj.text = bl[ele];
    } else {
      emojiObj.node = "text";
      emojiObj.text = ele;
    }
    emojiObjs.push(emojiObj);
  }

  return emojiObjs;
}

function toggleplay(that, app, cb) {
  cb = cb || null;
  if (that.data.disable) {
    return;
  }
  if (that.data.playing) {
    console.log("暂停播放");
    that.setData({ playing: false });
    app.stopmusic(1);
  } else {
    console.log("继续播放")
    that.setData({
      playing: true
    });
    app.seekmusic(app.globalData.playtype, app.globalData.currentPosition, cb);
  }
}
//加载转换歌词
function loadlrc(that) {
  if (that.data.showlrc) {
    that.setData({
      showlrc: false
    })
    return;
  } else {
    that.setData({
      showlrc: true
    })
  }
  if (!that.data.lrc.code) {
    var lrcid = that.data.music.id;
    var that = that;
    wx.request({
      url: bsurl + 'lyric?id=' + lrcid,
      success: function (res) {
        var lrc = parse_lrc(res.data.lrc && res.data.lrc.lyric ? res.data.lrc.lyric : '');
        res.data.lrc = lrc.now_lrc;
        res.data.scroll = lrc.scroll ? 1 : 0
        that.setData({
          lrc: res.data
        });
      }
    })
  }
}
//歌曲加心心，取消心，fm trash
function songheart(that, app, t, d) {
  var music = that.data.music
  wx.request({
    url: bsurl + 'song/tracks',
    data: {
      id: music.id,
      r: !d ? '' : 'del',
      op: !t ? 'like' : 'trash',
      cookie: app.globalData.cookie
    },
    success: function (res) {
      if (res.data.code == 200) {
        if (t) {
          app.nextfm();
          return;
        }
        music.st = !music.st;
        music.starred = !music.starred;
        that.setData({ music: music });
        app.globalData.curplay = music
        app.likelist();
        (app.globalData.playtype == 1) && app.globalData.list_am.splice(app.globalData.index_am, 1, music)
      } else {
        wx.navigateTo({
          url: '../login/index?t=1'
        })
      }
    }
  })
}
module.exports = {
  formatTime: formatTime,
  formatduration: formatduration,
  parse_lrc: parse_lrc,
  playAlrc: playAlrc,
  loadlrc: loadlrc,
  loadrec: loadrec,
  songheart: songheart,
  toggleplay: toggleplay
}
