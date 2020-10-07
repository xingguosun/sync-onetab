var urlListEle = document.getElementById("urlList");
var searchBtn = document.getElementById("search-btn");
var keywordsEle = document.getElementById("keywords");
var urls;
var urlsHTML = '';

keywordsEle.addEventListener("input", filter);
chrome.identity.getProfileUserInfo(function(userInfo) {
    console.log(userInfo)
   });
chrome.storage.local.get("urlList", function callback(result) {
    urls = result.urlList;
    urls = urls.sort((a, b) => b[4] - a[4]);
    console.log(urls)
    var urlsHTML = urls.map(element => {
        return listHtmlItem(element).html;
    });
    // for (var key in urls) {
    //     var item = urls[key];
    //     urlsHTML += listHtmlItem(key,item);
    // }
    // urlListEle.innerHTML = urlsHTML.join("");
    updateHTML(urlListEle, urlsHTML.join(""));
});

function filter() {
    urls = urls.sort((a, b) => b[4] - a[4]);
    const keywords = keywordsEle.value.toLowerCase().trim().split(" ");
    var urlsHTML = [];
    for(let element of urls) {
        let title = element[1].toLowerCase();
        if(keywords.some(kw => title.indexOf(kw.trim())>-1)) {
            urlsHTML.push(listHtmlItem(element, keywords));
        }
    }
    urlsHTML.sort((u1,u2) => u2.matchedNumer - u1.matchedNumer);
    console.log(urlsHTML);
    urlsHTML = urlsHTML.map(url => {return url.html?url.html:''});
    updateHTML(urlListEle, urlsHTML.join(""));
}

function listHtmlItem(element, keywords=null) {
    let url = element[0];
    let title = element[1];
    let newTitle = title;
    let favIconUrl = element[2];
    let description = element[3]==null?'':String(element[3]);
    // console.log(element);
    // let addTime = new Date();
    // addTime.setTime(element[4]);
    // addTime = addTime.format('dd-MM-yyyy hh:mm:ss');
    const timeObject = timestampFormat(element[4]);
    let addTime = timeObject.time;
    let timeClass = timeObject.timeClass;
    let matchedNumer = 0;
    if(keywords){
        // const keywords = keyword.split(" ");
        let positions = [];
        for(let k of keywords) {
            const position = title.toLowerCase().indexOf(k);
            if(position>-1 && positions.findIndex(pos => pos[0]==position)==-1) {
                positions.push([position, k.length]);
            }
        }
        positions.sort((a,b) => a[0] - b[0]);
        newTitle = '';
        let leftPos = 0;
        let keywordLength = 0;
        // let rightPos = title.length-1;
        for(let pos of positions){
            let keywordPos = pos[0];
            keywordLength = pos[1];
            const titleLeft = title.slice(leftPos, keywordPos);
            const kw = title.slice(keywordPos, keywordPos + keywordLength);
            newTitle += titleLeft+'<span class="keyword">'+kw+'</span>';
            leftPos = keywordPos + keywordLength;
            // console.log(leftPos+', '+keywordLength+', titleLeft: '+titleLeft+', kw: '+kw);
        }
        const titleRight = title.slice(leftPos);
        newTitle += titleRight;
        matchedNumer += positions.length;
        // positions.forEach(function(pos){
        //     const titleLeft = title.slice(0, pos);
        //     const kw = title.slice(position, position + k.length);
        //     const titleRigth = title.slice(position + k.length);
        //     const newTitleItem = titleLeft+'<span class="keyword">'+kw+'</span>'+titleRigth;
        
        // });
    }
    description = description.replace(/</g,"&lt;");
    description = description.replace(/>/g,"&gt;");
    var favIcon = favIconUrl?favIconUrl:'images/lostIcon.png';
    let results = {matchedNumer: matchedNumer, html: '<div id="'+url+'"><div class="brief-info"><a href="'+url+'" title="'+title+'" target="_blank"><img class="favIcon" src="'+favIcon+'"><h3 class="title">'+newTitle+'</h3></a><button class="del-bt"></button></div><p class="description" title="'+description+'"><span class="addTime '+ timeClass +'">'+addTime+'</span>'+description+'</p></div>'};
    return results;
}
function deleteUrl() {
    // console.log(this.getAttribute("url"));
    // console.log(this.parentNode.parentNode.id);
    let url = this.parentNode.parentNode.id;
    // chrome.runtime.sendMessage({
    //     method:"deleteUrl",
    //     url: url
    // });
    var urlList = [];
    chrome.storage.local.get("urlList", function callback(result) {
      urlList = result.urlList;
      urlList = urlList.filter( element => element[0] !== url);
      chrome.storage.local.set({urlList: urlList}, function() {
        console.log("Delete: "+url);
      });
    })
    removeElement(url);
}

function addDeleteListener() {
    let bts = document.getElementsByClassName("del-bt");
    [].forEach.call(bts, function(el) {
        el.addEventListener('click', deleteUrl);
    });
}
function updateHTML(node, content){
    node.innerHTML = content;
    addDeleteListener();
}
function removeElement(elementId) {
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}
Date.prototype.format = function(format) {
    var date = {
           "M+": this.getMonth() + 1,
           "d+": this.getDate(),
           "h+": this.getHours(),
           "m+": this.getMinutes(),
           "s+": this.getSeconds(),
           "q+": Math.floor((this.getMonth() + 3) / 3),
           "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
           format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
           if (new RegExp("(" + k + ")").test(format)) {
                  format = format.replace(RegExp.$1, RegExp.$1.length == 1
                         ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
           }
    }
    return format;
}

function unique(arr) {
    //定义常量 res,值为一个Map对象实例
    const res = new Map();
    //返回arr数组过滤后的结果，结果为一个数组
    //过滤条件是，如果res中没有某个键，就设置这个键的值为1
    return arr.filter((a) => !res.has(a) && res.set(a, 1))
}
function timestampFormat( timestamp ) {
 
    var curTimestamp = parseInt(new Date().getTime()); //当前时间戳
    var timestampDiff = (curTimestamp - timestamp)/1000; // 参数时间戳与当前时间戳相差秒数
 
    var curDate = new Date( curTimestamp  ); // 当前时间日期对象
    var tmDate = new Date( timestamp  );  // 参数时间戳转换成的日期对象
 
    var Y = tmDate.getFullYear(), m = tmDate.getMonth() + 1, d = tmDate.getDate();
    var H = tmDate.getHours(), i = tmDate.getMinutes(), s = tmDate.getSeconds();
    
    let time = 0;
    let timeClass = '';
    if ( timestampDiff < 60 ) { // 一分钟以内
        time = "Just now";
        timeClass = "just-now";
    } else if( timestampDiff < 3600 ) { // 一小时前之内
        time = Math.floor( timestampDiff / 60 ) + " minutes ago";
        timeClass = "within-one-hour";
    } else if ( curDate.getFullYear() == Y && curDate.getMonth()+1 == m && curDate.getDate() == d ) {
        time = 'Today ' + zeroize(H) + ':' + zeroize(i);
        timeClass = "today";
    } else {
        var newDate = new Date( (curTimestamp - 86400000) ); // 参数中的时间戳加一天转换成的日期对象
        if ( newDate.getFullYear() == Y && newDate.getMonth()+1 == m && newDate.getDate() == d ) {
            time = 'Yesterday ' + zeroize(H) + ':' + zeroize(i);
            timeClass = "yesterday";
        } else if ( curDate.getFullYear() == Y ) {
            time =  zeroize(m) + '/' + zeroize(d) + ' ' + zeroize(H) + ':' + zeroize(i);
            timeClass = "this-year";
        } else {
            time =  zeroize(m) + '/' + zeroize(d) + '/' + Y + ' ' + zeroize(H) + ':' + zeroize(i);
            timeClass = "one-year-ago";
        }
    }
    return {time: time, timeClass: timeClass};
}

function zeroize( num ) {
    return (String(num).length == 1 ? '0' : '') + num;
}
chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.method == "refresh"){
        window.location.reload();
    }
});