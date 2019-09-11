// Send message to eventPage.js to activate extension icon
chrome.runtime.sendMessage({todo: "showIcon"})

// Retrieve elements text for requested schema object
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.todo == "retrieveText") {
        let schema = request.schema

        for ( var element in schema) {
            schema[element] = getElementText(schema[element])
        }

        sendResponse(schema)
    }
})

function getElementText(className) {
    let elements = document.getElementsByClassName(className)

    return elements.length ? elements[0].innerText.trim() : ''
}