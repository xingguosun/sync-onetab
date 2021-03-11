// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// 'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({urlList: []}, function() {
    // console.log('');
  });
});

// chrome.browserAction.onClicked.addListener(function(tab) {
//   getWebPageDetails(tab.id, tab.url, tab.title, tab.favIconUrl);
  
// });

const listeners = {
  Search:(info, tab) => {
    chrome.tabs.create({
      'url': chrome.extension.getURL('search.html')
      }, function(tab) {
      // Tab opened.
      }
    );
  }
};
chrome.contextMenus.create({
  id: 'Search',
  title: 'Search',
  contexts: ['browser_action'],
  parentId: null
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  listeners[info.menuItemId] (info, tab);
});


 



// function getWebPageDetails(id, url, title, favIconUrl){
//   var info = {tabId: id, tabUrl: url, tabTitle: title, tabFavIconUrl: favIconUrl};
//   chrome.tabs.executeScript(null, {
//       code: 'var info = ' + JSON.stringify(info)
//   }, function() {
//       chrome.tabs.executeScript(null, {file: 'getPageDetails.js'});
//   });
//   // chrome.tabs.executeScript(null, {
// 	// 	file: "getPageDetails.js"
// 	// }, function() {
// 	// 	// If you try it into an extensions page or the webstore/NTP you'll get an error
// 	// 	if (chrome.runtime.lastError) {
// 	// 		message.innerText = 'There was an error : \n' + chrome.runtime.lastError.message;
// 	// 	}
// 	// });
// }
chrome.runtime.onMessage.addListener(function(request, sender) {
	// var metaTable = document.getElementById('metaTable');
	// if (request.method == "getMetas") {
	// 	for (var i=0; i<request.metas.length; i++) { 
	// 		metaTable.innerHTML += "<tr><td>"+request.metas[i][0]+"</td><td>"+request.metas[i][1]+"</td><td>"+request.metas[i][2]+"</td><td>"+request.metas[i][3]+"</td><td>"+request.metas[i][4]+"</td></tr>"; 
	// 	} 
  // }
  if (request.method == "addUrl"){
    createSearchPage();
    var details = request.details;
    chrome.tabs.remove(parseInt(details.tabId), function(){});

    var urlList =[];
    chrome.storage.local.get("urlList", function callback(result) {
      urlList = result.urlList;
      // if (typeof urlList === 'object') {
      //   urlList = [];
      // }
      let url = details.url;
      let title = details.title;
      let favIconUrl = details.favIconUrl;
      let description = details.description;
      let addTime =  new Date().getTime();
      urlList = urlList.filter( element => element[0] !== url);
      urlList.push([url, title, favIconUrl, description, addTime]);
      chrome.storage.local.set({urlList: urlList}, function() {
        // console.log('Webpage saved');
        //console.log(urlList);
      });
      var db = firebase.firestore();
      db.collection("tabs").add({
          url: url,
          title: title,
          favicon: favIconUrl,
          description: description,
          tiem: addTime
      })
      .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
      })
      .catch((error) => {
          console.error("Error adding document: ", error);
      });
    });
  }
  if (request.method == "deleteUrl") {
    var url = request.url;
    var urlList = [];
    console.log("Delete: "+url);
    console.log("From: "+ urlList);
    chrome.storage.local.get("urlList", function callback(result) {
      urlList = result.urlList;
      urlList = urlList.filter( element => element[0] !== url);
      chrome.storage.local.set({urlList: urlList}, function() {
      });
    })
  }
  if (request.method == "updateIcon") {
    if (request.value) {
        chrome.browserAction.setIcon({path: "/images/search500.png"});
    } else {
        chrome.browserAction.setIcon({path: "/images/search500-grey.png"});
    }
  }
});

function createSearchPage(){
  chrome.tabs.query({currentWindow: true}, function(tabs) {
    const searchPage = tabs.find(tab => tab.url == chrome.extension.getURL('search.html'));
    if (searchPage != undefined) {
      chrome.runtime.sendMessage({
        method:"refresh",
        details:{
            
        }
    });
      // chrome.tabs.executeScript(searchPage.id, {
      //   code: 
      //       'window.location.reload();'
      // }, function(result) {
      // });
    }else{
      chrome.tabs.create({
        'url': chrome.extension.getURL('search.html')
      }, function(tab) {
      });
    }
  });
}
