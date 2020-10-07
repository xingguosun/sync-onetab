var meta = document.querySelector("meta[name='description']");
var description = '';
if (meta) {
    description = meta.getAttribute("content");
}
chrome.runtime.sendMessage({
    method: "getDetails",
    details: {
        // tabId: info.tabId,
        // title: info.tabTitle,
        // url: info.tabUrl,
        // favIconUrl: info.tabFavIconUrl,
        description: description,
    }
});