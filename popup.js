const server = "https://cv-document-writer.herokuapp.com/"

// Populate popup window with candidate data
chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    loadingStart()
    fetch(server + 'schema')
    .then( res => res.json())
    .then( data => {
        chrome.tabs.sendMessage(tabs[0].id, {todo: 'retrieveText', schema: data}, (response) => {

            console.log(response)
            document.getElementById('name').value = response.name
            document.getElementById('company').value = response.company
            document.getElementById('city').value = response.city
            loadingEnd()
        })
    })
    .catch((error) => {
        notify('error', 'Server does not response')
    })
})

// Send candidate data througth API to server
window.addEventListener('load', function (evt) {
    document.getElementById("send").addEventListener("click", function() {
        let user = {
            name: document.getElementById('name').value,
            company: document.getElementById('company').value,
            //city: document.getElementById('city').value,
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
        window.close()
    })
}

function loadingStart() {
    document.querySelector('button').setAttribute('disabled','')
    document.getElementById('button-text').style.display = 'none'
    document.getElementById('loading-text').style.display = 'block'
}

function loadingEnd() {
    document.querySelector('button').removeAttribute('disabled')
    document.getElementById('button-text').style.display = 'block'
    document.getElementById('loading-text').style.display = 'none'
}