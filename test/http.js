import {showGlobalDialog} from '../pub/ui/globalDialog.js'
import {signByCryptoAgent} from '../pub/CryptoAgent.js'
 
const errorMessage = {
    text: '网络请求异常，请重新尝试！',
    buttonType: 'BUTTON_TYPE_CENTER',
    okButtonText: "确定",
    okHandleClick: function() {
        //
    }
}
 
const errorTimeoutMessage = {
    text: '系统开小差，请稍后重试！',
    buttonType: 'BUTTON_TYPE_CENTER',
    okButtonText: "确定",
    okHandleClick: function() {
        //
    }
}

export function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}
 
export function fetchGet(url, data, callback, failed) {
    if(data && data.sign) delete data.sign;
    data.signDate = new Date().getTime();
    signByCryptoAgent(data,function(sign){
        data.sign = sign.value || "";
        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            async: true,
            data: toQueryString(data),//JSON.stringify(data),
            contentType: 'application/json',
            timeout:15000,
            success: function(result) {
                if(result.respCode==999997){
                    location.replace('/login/index.html')
                    return false
                }else if(result.respCode == 999995){
                    location.replace("/login/index.html?kickout=1")
                    return false
                }else if(result.respCode==999999){
                    location.replace('/deny.html')
                    return false
                }
 
                callback(result);
            },
            error: function(error,status) {
                if(status == "timeout")
                    showGlobalDialog(errorTimeoutMessage.text)
                else if(error && error.responseJSON){
                    showGlobalDialog(error.responseJSON.respMsg)
                }else if(failed)failed(error,status)
                else showGlobalDialog(errorMessage.text)

                
            },
            complete: function() {
                // VH.ui.hideLoading()
            }
        });
    })
    
}

export function fetchGetWithoutSign(url, data, callback, failed) {
    data.sign = "";
    data.signDate = new Date().getTime();
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        async: true,
        data: toQueryString(data),//JSON.stringify(data),
        contentType: 'application/json',
        timeout:15000,
        success: function(result) {
            if(result.respCode==='999997'){
                location.replace('/login/index.html')
                return false
            }
            callback(result);
        },
        error: function(error,status) {
            if(status == "timeout")
                showGlobalDialog(errorTimeoutMessage.text)
            else if(error && error.responseJSON){
                showGlobalDialog(error.responseJSON.respMsg)
            }
            else showGlobalDialog(errorMessage.text)
            if(failed)failed(error,status)
            
        },
        complete: function() {
            // VH.ui.hideLoading()
        }
    });
    
}

export function fetchPost(url, data, callback, failed) {
    //VH.ui.showLoading()
    if(data && data.sign) delete data.sign;
    data.signDate = new Date().getTime();
    signByCryptoAgent(data,function(sign){
        data.sign = sign.value || "";
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            async: true,
            data:  toQueryString(data),
            timeout:15000,
            contentType: 'application/x-www-form-urlencoded',
            xhrFields: {
                withCredentials: true
            },
            success: function(result) { 
                if(result.respCode==="999997"){
                    location.replace('/login/index.html')
                    return false
                }else if(result.respCode==='999999'){
                    location.replace('/deny.html')
                    return false
                }
                callback(result);
            },
            error: function(error,status) {
                if(status == "timeout")
                    showGlobalDialog(errorTimeoutMessage.text)
                else if(error && error.responseJSON){
                    showGlobalDialog(error.responseJSON.respMsg)
                }else if(failed)failed(error,status);
                else showGlobalDialog(errorMessage.text)
            },
            complete: function() {
                //VH.ui.hideLoading()
            }
        });
    });
}
export function fetchPostWithoutSign(url, data, callback, failed) {
    //VH.ui.showLoading()
    data.signDate = new Date().getTime();
    data.sign = "";
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        async: true,
        data:  toQueryString(data),
        timeout:15000,
        contentType: 'application/x-www-form-urlencoded',
        xhrFields: {
            withCredentials: true
        },
        success: function(result) { 
            if(result.respCode==="999997"){
                location.replace('/login/index.html')
                return false
            }
            callback(result);
        },
        error: function(error,status) {
            if(status == "timeout")
                showGlobalDialog(errorTimeoutMessage.text)
            else if(error && error.responseJSON){
                showGlobalDialog(error.responseJSON.respMsg)
            }
            else showGlobalDialog(errorMessage.text)
            if(failed)failed(error,status);
        },
        complete: function() {
            //VH.ui.hideLoading()
        }
    });
}
//下载账单使用，暂定，后面需要优化
export function fetchDownloadCallback(url,data,callback){
    var downloadForm = document.createElement("form");
    var iframe = document.createElement('iframe');
    iframe.name = "nodisplay"
    iframe.style.display = "none";
    downloadForm.style.display = "none";
    downloadForm.target = "nodisplay";
    downloadForm.action = url;
    downloadForm.method = "get";
    if(data){
        if(data.sign == undefined){
            data.signDate = new Date().getTime();
            signByCryptoAgent(data,function(sign){
                data.sign = sign.value || "";
                fetchDownloadCallback(url,data,callback)
            });
            return;
        }
        $.each(data,function(param,val){
            var ipt = document.createElement("input");
            ipt.name = param;
            ipt.value = val;
            downloadForm.appendChild(ipt);
        })
    }
    if(document.body){
        document.body.appendChild(downloadForm);
    }
    document.body.appendChild(iframe);
    callback&&callback()
    downloadForm.submit();
}
export function fetchDownload(url,data){
    var downloadForm = document.createElement("form");
    downloadForm.style.display = "none";
    downloadForm.target = "_blank";
    downloadForm.action = url;
    downloadForm.method = "get";
    if(data){
        if(data.sign == undefined){
            data.signDate = new Date().getTime();
            signByCryptoAgent(data,function(sign){
                data.sign = sign.value || "";
                fetchDownload(url,data)
            });
            return;
        }
        $.each(data,function(param,val){
            var ipt = document.createElement("input");
            ipt.name = param;
            ipt.value = val;
            downloadForm.appendChild(ipt);
        })
    }
    if(document.body){
        document.body.appendChild(downloadForm);
    }
    downloadForm.submit();
}
export function fetchUpload(data, args){
    if(args && args.sign) delete args.sign;
    args.signDate = new Date().getTime();
    signByCryptoAgent(args, function(sign){
        args.sign = sign.value || "";
        data.formData = args;
        data.submit(); 
    });
}
function toQueryString(obj) {
    return obj ? Object.keys(obj).sort().map(function(key) {
        var val = obj[key];
        if (Array.isArray(val)) {
            return val.sort().map(function(val2,i) {
                return encodeURIComponent(key) + "[" + i + "]" + '=' + encodeURIComponent(val2);
            }).join('&');
        }
        return encodeURIComponent(key) + '=' + encodeURIComponent(val);
    }).join('&') : '';
}
export function getQueryStringByName(name) {
    var result = decodeURIComponent(location.search).match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
    if (result == null || result.length < 1) {
        return "";
    }
    return result[1];
}
 
//
//{name:'jack',age:18} => name=jack&age=18
export function paramObj2paramStr(url, obj) {
    var newUrl = ''
    var paramStr = '&' + toQueryString(obj);
    // for (var i in obj) {
    //  paramStr += '&' + i + '=' + obj[i]
    // }
    if (url.indexOf('&') > -1) {
        newUrl = url + paramStr
    } else if (url.indexOf('?') > -1) {
        if (url.indexOf('=') > -1) {
            newUrl = url + paramStr
        } else {
            newUrl = url + paramStr.substring(1)
        }
 
    } else {
        newUrl = url + '?' + paramStr.substring(1)
    }
    return newUrl
}
// name=jack&age=18 => {name:'jack',age:18}
export function paramStr2paramObj(url) {
    var search = decodeURIComponent(url).replace(/^\s+/, '').replace(/\s+$/, '').match(/([^?#]*)(#.*)?$/); //提取location.search中'?'后面的部分 
    if (!search) {
        return {};
    }
    var searchStr = search[1];
    var searchHash = searchStr.split('&');
 
    var ret = {};
    for (var i = 0, len = searchHash.length; i < len; i++) { //这里可以调用each方法 
        var pair = searchHash[i];
        if ((pair = pair.split('='))[0]) {
            var key = pair.shift();
            var value = pair.length > 1 ? pair.join('=') : pair[0];
            if (value != undefined) {
                value = value;
            }
            ret[key] = value;
            // 删除数组
            // if (key in ret) {
            //  if (ret[key].constructor != Array) {
            //      ret[key] = [ret[key]];
            //  }
            //  ret[key].push(value);
            // } else {
            //  ret[key] = value;
            // }
        }
    }
    return ret;
}