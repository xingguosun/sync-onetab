// chrome.browserAction.onClicked.addListener(function(tab) {
//     chrome.browserAction.setTitle({tabId: tab.id, title: "You are on tab:" + tab.id});
//   });

// chrome.browserAction.onClicked.addListener(function(tab) {
//   // No tabs or host permissions needed!
//   console.log('Turning ' + tab.url + ' red!');
//   chrome.tabs.executeScript({
//     code: 'document.body.style.backgroundColor="red"'
//   });
// });

// chrome.runtime.sendMessage({
//   method: 'updateIcon',
//   value: false
// });

var meta = document.querySelector("meta[name=\'description\']");
var description = "";
if (meta) {
    description = meta.getAttribute("content");
}