const socket = io()

// Elements
const $messageform = document.querySelector('#message-form')
const $messageFormButton = $messageform.querySelector('button')
const $FormInput = document.querySelector('#msg')
const $messages = document.querySelector('#messages')
const $locations = document.querySelector('#locations')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
    // Get new message element
    const $newMessage = $messages.lastElementChild

    // get Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }


    console.log(newMessageHeight)

}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        sent: moment(message.sent).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.location,
        sent: moment(url.sent).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomUsers', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
$messageform.addEventListener('submit', (e) => {
    e.preventDefault();
    //disable form
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = $FormInput.value
    socket.emit('showMessage', message, (error) => {

        //enable
        $messageFormButton.removeAttribute('disabled')
        $FormInput.value = ''
        $FormInput.focus()
        if (error) {
            return console.log(error)
        }

        console.log('Message delivered')
    })
    
})

const $locationBtn = document.querySelector('#send-location')


$locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    $locationBtn.setAttribute('disabled', 'disabled')


    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            "longitude": position.coords.longitude,
            "latitude": position.coords.latitude
        }, () => {
            $locationBtn.removeAttribute('disabled')
            console.log('Location delivered')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error){
        alert(error)
        location.href= '/'
    }

})

