/**
 * author: Di (微信小程序开发工程师)
 * organization: WeAppDev(微信小程序开发论坛)(http://weappdev.com)
 *               垂直微信小程序开发交流社区
 * 
 * github地址: https://github.com/icindy/WxNotificationCenter
 * 
 * for: 微信小程序通知广播模式类,降低小程序之间的耦合度
 * detail : http://weappdev.com/t/wxnotificationcenter/233
 */
// 存放
var __notices = [];
var isDebug = true;
/**
 * addNotification
 * 注册通知对象方法
 * 
 * 参数:
 * name： 注册名，一般let在公共类中
 * selector： 对应的通知方法，接受到通知后进行的动作
 * observer: 注册对象，指Page对象
 */
function addNotification(name, selector, observer) {
    if (name && selector) {
        if(!observer){
            console.log("addNotification Warning: no observer will can't remove notice");
        }
        console.log("addNotification:" + name);
        var newNotice = {
            name: name,
            selector: selector,
            observer: observer
        };

        addNotices(newNotice);

    } else {
        console.log("addNotification error: no selector or name");
    }
}

/**
 * 仅添加一次监听
 * 
 * 参数:
 * name： 注册名，一般let在公共类中
 * selector： 对应的通知方法，接受到通知后进行的动作
 * observer: 注册对象，指Page对象
 */
function addOnceNotification(name, selector, observer) {
    if (__notices.length > 0) {
        for (var i = 0; i < __notices.length; i++) {
            var notice = __notices[i];
            if (notice.name === name) {
                if (notice.observer === observer) {
                    return;
                }
            }
        }
        this.addNotification(name, selector, observer)
    }
}

function addNotices(newNotice) {
    // if (__notices.length > 0) {
    //     for (var i = 0; i < __notices.length; i++) {
    //         var hisNotice = __notices[i];
    //         //当名称一样时进行对比，如果不是同一个 则放入数组，否则跳出
    //         if (newNotice.name === hisNotice.name) {
    //             if (!cmp(hisNotice, newNotice)) {
    //                 __notices.push(newNotice);
    //             }
    //             return;
    //         }else{
    //             __notices.push(newNotice);
    //         }

    //     }
    // } else {
        
    // }

    __notices.push(newNotice);
}

/**
 * removeNotification
 * 移除通知方法
 * 
 * 参数:
 * name: 已经注册了的通知
 * observer: 移除的通知所在的Page对象
 */

function removeNotification(name,observer) {
    console.log("removeNotification:" + name);
    for (var i = 0; i < __notices.length; i++){
      var notice = __notices[i];
      if(notice.name === name){
        if(notice.observer === observer){
            __notices.splice(i,1);
            return;
        }
      }
    }


}

/**
 * postNotificationName
 * 发送通知方法
 * 
 * 参数:
 * name: 已经注册了的通知
 * info: 携带的参数
 */

function postNotificationName(name, info) {
    console.log("postNotificationName:" + name);
    if(__notices.length == 0){
      console.log("postNotificationName error: u hadn't add any notice.");
      return;
    }

    for (var i = 0; i < __notices.length; i++){
      var notice = __notices[i];
      if(notice.name === name){
        notice.selector(info);
      }
    }
    
}

// 用于对比两个对象是否相等
function cmp(x, y) {
    // If both x and y are null or undefined and exactly the same  
    if (x === y) {
        return true;
    }

    // If they are not strictly equal, they both need to be Objects  
    if (! (x instanceof Object) || !(y instanceof Object)) {
        return false;
    }

    // They must have the exact same prototype chain, the closest we can do is  
    // test the constructor.  
    if (x.constructor !== y.constructor) {
        return false;
    }

    for (var p in x) {
        // Inherited properties were tested using x.constructor === y.constructor  
        if (x.hasOwnProperty(p)) {
            // Allows comparing x[ p ] and y[ p ] when set to undefined  
            if (!y.hasOwnProperty(p)) {
                return false;
            }

            // If they have the same strict value or identity then they are equal  
            if (x[p] === y[p]) {
                continue;
            }

            // Numbers, Strings, Functions, Booleans must be strictly equal  
            if (typeof(x[p]) !== "object") {
                return false;
            }

            // Objects and Arrays must be tested recursively  
            if (!Object.equals(x[p], y[p])) {
                return false;
            }
        }
    }

    for (p in y) {
        // allows x[ p ] to be set to undefined  
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
            return false;
        }
    }
    return true;
};

module.exports = {
    addNotification: addNotification,
    removeNotification: removeNotification,
    postNotificationName: postNotificationName,
    addOnceNotification: addOnceNotification
}