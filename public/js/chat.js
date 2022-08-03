const socket = io();

// Elements
const $messages = document.querySelector('#messages');
const $messageForm = document.querySelector('#chat-app-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $shareLocationButton = document.querySelector('#chat-app-share-location');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

// Functions
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible Height
    const visibleHeight = $newMessage.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    console.log('log');
    console.log(visibleHeight);
    console.log(containerHeight);
    console.log(newMessageHeight);
    console.log(scrollOffset);

    if (containerHeight - newMessageHeight <= scrollOffset) {
        console.log('scroll');
        $messages.scrollTop = $messages.scrollHeight;
    }
    else {
        $messages.scrollTop += newMessageHeight;
    }
};

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $sidebar.innerHTML = html;
});

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm')
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoscroll();
});

socket.on('locationMessage', (locationMessage) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: locationMessage.username,
        locationUrl: locationMessage.locationUrl,
        createdAt: moment(locationMessage.createdAt).format('hh:mm')
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoscroll();
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // disable the submit button while sending message
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        // enable the submit button after sending the message out regardless of the result
        $messageFormButton.removeAttribute('disabled');

        if (error) {
            return console.log(error);
        }

        $messageFormInput.value = null;
        $messageFormInput.focus();

        console.log('The message is delivered.');
    });
});

$shareLocationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by the browser.');
    }

    // disable the button while fetching the geolocation
    $shareLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        socket.emit('sendLocation', coords, (error) => {
            if (error) {
                return console.log(error);
            }
            console.log('Location shared.');
        });
    });

    // enable the button again after finished sharing the geolocation
    $shareLocationButton.removeAttribute('disabled');
});

socket.emit('join', {
        username,
        room
    }, (error) => {
        if (error) {
            alert(error);
            location.href = '/';
        };
    }
);