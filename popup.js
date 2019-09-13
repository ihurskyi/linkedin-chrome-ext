const server = "https://cv-document-writer.herokuapp.com/"

let elements = {
    technology: "technology"
}

// Populate popup window with candidate data
chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    loadingStart()
    
    // Fetch css classes for linkedin page, populate popup fields 
    fetch(server + 'schema')
    .then( res => res.json())
    .then( data => {
        chrome.tabs.sendMessage(tabs[0].id, {todo: 'retrieveText', schema: data}, (response) => {
            console.log(response)
            $('#name').val(response.name)
            $('#company').val(response.company)
            $('#city').val(response.city)
            loadingEnd()
        })
    })
    .catch((error) => {
        notify('error', 'Server does not response')
    })

    // Populate technology dropdown list with available sheets
    fetch(server + 'sheets')
    .then( res => res.json())
    .then( data => {
        data.forEach(element => {
            $(`.${elements.technology}`).append(`<option value="${element.id}">${element.title}</option>`)
        });
    })
    .catch((error) => {
        notify('error', 'Server does not response')
    })
})



// Send candidate data througth API to server
window.addEventListener('load', function (evt) {
    let form = document.querySelector('form');

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        
        if (form.checkValidity() === false) {
            event.stopPropagation();
            return;
        }

        let user = {
            name: $('#name').val(),
            company: $('#company').val(),
            city: $('#city').val(),
            sheet: $(`.${elements.technology}`).val()
        }
        
        const promiseTabUrl= new Promise((resolve, reject) => {
            chrome.tabs.getSelected(null, (tab) => {
                user.linkedin = tab.url
                resolve(tab.url)
            })
        })
        
        const promiseEmail = new Promise((resolve, reject) => {
            chrome.identity.getProfileUserInfo((userInfo) => {
                user.recruiter = userInfo.email;
                resolve(userInfo.email)
            })
        })

        Promise.all([promiseTabUrl, promiseEmail]).then(async (val) => {
            let options = {
                method: 'post', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(user)
            }

            loadingStart()

            fetch(server + 'add', options)
            .then( response => response.text())
            .then( data => {
                notify('success', data)
            }).catch((error) => {
                notify('error', 'Server error!' + error)
            })
        })

        return;
    })
});

function notify(type, message) {
    let options = {
        type: 'basic',
        iconUrl: 'images/' + type + '.png',
        title: 'Request result',
        message
    }

    chrome.notifications.create('notification', options, (notificationId) => {
        loadingEnd()
        //window.close()
    })
}

function loadingStart() {
    $('#send').attr('disabled', true)
    $('#button-text').hide()
    $('#loading-text').show()
}

function loadingEnd() {
    $('#send').removeAttr('disabled')
    $('#button-text').show()
    $('#loading-text').hide()
}