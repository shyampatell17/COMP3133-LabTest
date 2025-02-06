const socket = io();
let currentRoom = '';
const username = localStorage.getItem('username');

if (!username) {
    window.location.href = '/login';
}

// DOM Elements
const roomSelect = document.getElementById('roomSelect');
const joinRoomBtn = document.getElementById('joinRoom');
const leaveRoomBtn = document.getElementById('leaveRoom');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const chatContainer = document.getElementById('chat');
const currentRoomElement = document.getElementById('currentRoom');
const typingIndicator = document.getElementById('typingIndicator');
const logoutBtn = document.getElementById('logout');

// Join Room
joinRoomBtn.addEventListener('click', () => {
    const room = roomSelect.value;
    if (room) {
        if (currentRoom) {
            socket.emit('leaveRoom', { username, room: currentRoom });
        }
        currentRoom = room;
        socket.emit('joinRoom', { username, room });
        currentRoomElement.textContent = room;
    }
});

// Leave Room
leaveRoomBtn.addEventListener('click', () => {
    if (currentRoom) {
        socket.emit('leaveRoom', { username, room: currentRoom });
        currentRoom = '';
        currentRoomElement.textContent = 'Not Selected';
        chatContainer.innerHTML = '';
    }
});

// Send Message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    if (message && currentRoom) {
        socket.emit('chatMessage', { username, room: currentRoom, message });
        messageInput.value = '';
    }
});

// Typing indicator
let typingTimeout;
messageInput.addEventListener('input', () => {
    if (currentRoom) {
        // Clear any existing timeout
        clearTimeout(typingTimeout);
        
        // Emit typing event
        socket.emit('typing', { username, room: currentRoom });
        
        // Set timeout to stop typing
        typingTimeout = setTimeout(() => {
            socket.emit('stopTyping', { room: currentRoom });
        }, 1000);
    }
});

// Private messaging
function sendPrivateMessage(toUser) {
    const message = prompt(`Send private message to ${toUser}:`);
    if (message) {
        socket.emit('privateMessage', {
            from: username,
            to: toUser,
            message
        });
    }
}

// Socket events
socket.on('message', (data) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(data.from_user === username ? 'bg-light' : 'bg-info');
    div.innerHTML = `<strong>${data.from_user}:</strong> ${data.message}`;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

socket.on('typing', (data) => {
    console.log('Typing event received:', data); // Debug log
    typingIndicator.textContent = `${data.username} is typing...`;
    typingIndicator.style.display = 'block';
});

socket.on('stopTyping', () => {
    console.log('Stop typing event received'); // Debug log
    typingIndicator.textContent = '';
    typingIndicator.style.display = 'none';
});

socket.on('privateMessage', (data) => {
    const div = document.createElement('div');
    div.classList.add('message', 'private');
    
    if (data.to) {
        div.innerHTML = `<strong>Private message to ${data.to}:</strong> ${data.message}`;
    } else {
        div.innerHTML = `<strong>Private message from ${data.from}:</strong> ${data.message}`;
    }
    
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

socket.on('roomUsers', (users) => {
    userList.innerHTML = '<h6>Users in Room:</h6>';
    users.forEach(user => {
        if (user !== username) {
            const div = document.createElement('div');
            div.classList.add('user-item');
            div.innerHTML = `
                <span>${user}</span>
                <button class="btn btn-sm btn-primary" onclick="sendPrivateMessage('${user}')">
                    Message
                </button>
            `;
            userList.appendChild(div);
        }
    });
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    window.location.href = '/login';
});

// Add private messaging UI
const userList = document.createElement('div');
userList.classList.add('user-list');
document.querySelector('.col-md-3').appendChild(userList);

// Private message form
const privateMessageForm = document.createElement('div');
privateMessageForm.innerHTML = `
    <div class="modal fade" id="privateMessageModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Send Private Message</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="text" id="privateMessageInput" class="form-control" placeholder="Type your message...">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="sendPrivateMessage">Send</button>
                </div>
            </div>
        </div>
    </div>
`;
document.body.appendChild(privateMessageForm);

// Send private message
let selectedUser = null;
document.getElementById('sendPrivateMessage').addEventListener('click', () => {
    const message = document.getElementById('privateMessageInput').value;
    if (message && selectedUser) {
        socket.emit('privateMessage', {
            from_user: username,
            to_user: selectedUser,
            message
        });
        document.getElementById('privateMessageInput').value = '';
        bootstrap.Modal.getInstance(document.getElementById('privateMessageModal')).hide();
    }
});

// Load previous messages when joining room
socket.on('loadPreviousMessages', (messages) => {
    chatContainer.innerHTML = '';
    messages.forEach(msg => {
        const div = document.createElement('div');
        div.classList.add('message');
        div.classList.add(msg.from_user === username ? 'bg-light' : 'bg-info');
        div.innerHTML = `<strong>${msg.from_user}:</strong> ${msg.message}`;
        chatContainer.appendChild(div);
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

socket.on('messageError', (error) => {
    alert(error);
}); 