// Activates extension icon. Request message from content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.todo == "showIcon") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.pageAction.show(tabs[0].id)
        })
    }
})