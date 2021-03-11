document.addEventListener('DOMContentLoaded', function() {
    let titleEle = document.getElementById("title");
    let descriptionEle = document.getElementById("description");
    let favIconEle = document.getElementById("favIcon");
    let addButton = document.getElementById("addButton");
    let addAllButton = document.getElementById("addAllButton");

    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
        let tabId = tabs[0].id;
        let url = tabs[0].url;
        let title = tabs[0].title;
        let favIconUrl = tabs[0].favIconUrl;

        titleEle.innerText = title;
        favIconEle.src = favIconUrl?favIconUrl:'images/lostIcon.png';
        if(!url.startsWith('chrome')) {
            getWebPageDetails();
        }
        addButton.addEventListener('click', function(){
            chrome.runtime.sendMessage({
                method:"addUrl",
                details:{
                    tabId: tabId,
                    url: url,
                    favIconUrl: favIconUrl,
                    title: titleEle.innerText,
                    description: descriptionEle.innerText
                }
            });
        });
        addAllButton.addEventListener('click', function(){
            chrome.tabs.query({currentWindow: true}, function(tabs) {
                let urlList = [];
                chrome.storage.local.get("urlList", function callback(result) {
                    urlList = result.urlList;                    
                    tabs.forEach(function(tab) {
                        let addTime =  new Date().getTime();
                        // urlList = urlList.filter( element => element[0] !== tab.url);
                        let duplicatedIndex = urlList.findIndex(element => element[0] == tab.url);
                        if(duplicatedIndex >-1){
                            urlList[duplicatedIndex] = [tab.url, tab.title, tab.favIconUrl, urlList[duplicatedIndex][3], addTime];
                        }else{
                            urlList.push([tab.url, tab.title, tab.favIconUrl, "", addTime]);
                        }
                        chrome.tabs.remove(parseInt(tab.id), function(){});      
                    });
                    
                createSearchPage();
                    chrome.storage.local.set({urlList: urlList}, function() {
                        createSearchPage();
                        // console.log('Webpage saved');
                        //console.log(urlList);
                    });
                });
            });
        })
    });
});
function getWebPageDetails(){
    // var info = {tabId: id, tabUrl: url, tabTitle: title, tabFavIconUrl: favIconUrl};
    var info = {};
    chrome.tabs.executeScript(null, {
        code: 'var info = ' + JSON.stringify(info)
    }, function() {
        chrome.tabs.executeScript(null, {file: 'getPageDetails.js'});
    });
}

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.method == "getDetails"){
        var details = request.details;
        let description = details.description;
        let descriptionEle = document.getElementById("description");
        descriptionEle.innerText = description;
      }
});

function addTabs (tabs){
    let saveTabs = [];
    tabs.forEach(function(tab) {
        let newTab = tab;
        if (!tab.url.startsWith('chrome')) {
            // console.log(tab.url);
            chrome.tabs.executeScript(tab.id, {
                code: 
                    'var meta = document.querySelector("meta[name=\'description\']");'+
                    'var description = "";'+
                    'if (meta) {'+
                        'description = meta.getAttribute("content");'+
                    '}'
            }, function(result) {
                // chrome.tabs.remove(parseInt(tab.id), function(){});
                newTab.description = result?String(result):'';
                // saveTabs.push(newTab);
                addUrls ([newTab]);
                // alert(result);
                // chrome.runtime.sendMessage({
                //     method:"addUrl",
                //     details:{
                //         tabId: tab.id,
                //         url: tab.url,
                //         favIconUrl: tab.favIconUrl,
                //         title: tab.title,
                //         description: result?result:''
                //     }
                // });
            });
        }else{
            // chrome.tabs.remove(parseInt(tab.id), function(){});
            // saveTabs.push(newTab);
            // console.log(tab.url);
        }
        // saveTabs.push(newTab);
    });
    // addUrls (saveTabs); 
    // while(true){
    //     sleep(500).then(() => {
            
    //         if(saveTabs.length >= tabs.length){
    //             console.log('saveTabs: '+saveTabs);
    //             console.log('tabs: '+tabs);
    //             break;
    //         }
    //     })
    // }
}

function addUrls (tabs){
    let urlList =[];
    chrome.storage.local.get("urlList", function callback(result) { 
        urlList = result.urlList;
        for(let item of tabs){
            let url = item.url;
            urlList = urlList.filter( element => element[0] !== url);
            urlList.push(
                [
                    url, 
                    item.title, 
                    item.favIconUrl, 
                    item.description, 
                    new Date().getTime()
                ]
            );
        }
        chrome.storage.local.set({urlList: urlList}, function() {
        });
    });
}
// function sleep (time) {
//     return new Promise((resolve) => setTimeout(resolve, time));
//   }
  

function createSearchPage (){
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      const searchPage = tabs.find(tab => tab.url == chrome.extension.getURL('search.html'));
      if (searchPage != undefined) {
        chrome.tabs.executeScript(searchPage.id, {
          code: 
              'window.location.reload();'
        }, function(result) {
        });
      }else{
        chrome.tabs.create({
          'url': chrome.extension.getURL('search.html')
        }, function(tab) {
        });
      }
    });
  }