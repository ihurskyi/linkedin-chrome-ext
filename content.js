// Send message to eventPage.js to activate extension icon
chrome.runtime.sendMessage({todo: "showIcon"})

// Retrieve elements text for requested schema object
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.todo == "retrieveText") {
        let schema = request.schema

        for ( var element in schema) {
            let elementData = getElementText(schema[element])

            schema[element] = fieldsCallbacks.hasOwnProperty(element)
                ? fieldsCallbacks[element](elementData)
                : elementData
        }

        sendResponse(schema)
    }
})

let fieldsCallbacks = {
    city : function (cityText) {
        let cities = [
            'Lviv',
            'Kyiv',
            'Kiev',
            'Odesa',
            'Kharkiv',
            'Dnipro',
            'Vinnytsia',
            'Ivano-Frankivsk',
            'Poltava',
            'Lutsk',
            'Khmelnytskyi',
            'Cherkasy'
        ]

        for (let city of cities) {
            if (cityText.includes(city)) {
                cityText = city;
                break;
            }
        }
    
        return cityText;
    }
}

function getElementText(path) {
    let data = '';

    if (!Array.isArray(path)) {
        path = [path]
    }

    for(let item of path) {
        let element = $(item)
        data = element.length ? element.text().trim() : ''
        
        if (data) {
            break;
        }
    }

    return data;
}