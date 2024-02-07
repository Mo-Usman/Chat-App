// Connecting to the server
const socket = io()

// Input Elements
const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const sendLocation = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { Username, Room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Function for autoscrolling
const autoScroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible Height
    const visibleHeight = messages.offsetHeight

    // Height of messages container/content
    const conatinerHeight = messages.scrollHeight

    // Figuring out how far we've scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if(conatinerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// Listening for the URL event
socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// Listening for room data event
socket.on('roomData', ({ room, users }) => {
   const html = Mustache.render(sidebarTemplate, {
    room,
    users
   })
   document.querySelector('#sidebar').innerHTML = html
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {

        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()

        if(error) {
           return console.log(error)
        }
        console.log('Message delivered!')
    })
})

sendLocation.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocaion is not supported by your browser')
    }

    sendLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
            socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            sendLocation.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

// Emitting an event to send username and room name to the server
socket.emit('join', { Username, Room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})