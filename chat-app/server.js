const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const GroupMessage = require('./models/GroupMessage');
const PrivateMessage = require('./models/PrivateMessage');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Add these new routes for user authentication
app.post('/api/users/signup', async (req, res) => {
    try {
        const { username, firstname, lastname, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            username,
            firstname,
            lastname,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({ 
            message: 'Login successful',
            token: 'dummy-token' // In a real app, you'd generate a JWT here
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Serve HTML files
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Add this new route for the chat page
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'chat.html'));
});

// Add this route for the root path
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Track users and their rooms
const users = new Map();

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    // Handle joining room
    socket.on('joinRoom', async ({ username, room }) => {
        socket.join(room);
        users.set(socket.id, { username, room });
        
        // Welcome message
        socket.emit('message', {
            from_user: 'ChatBot',
            message: `Welcome to ${room}!`
        });

        // Load previous messages
        try {
            const previousMessages = await GroupMessage.find({ room })
                .sort({ date_sent: -1 })
                .limit(20);
            socket.emit('message', ...previousMessages.reverse());
        } catch (error) {
            console.error('Error loading messages:', error);
        }

        // Broadcast when a user connects
        socket.broadcast.to(room).emit('message', {
            from_user: 'ChatBot',
            message: `${username} has joined the chat`
        });

        // Update user list
        const roomUsers = Array.from(users.values())
            .filter(user => user.room === room)
            .map(user => user.username);
        io.to(room).emit('roomUsers', roomUsers);
    });

    // Listen for chat message
    socket.on('chatMessage', async ({ username, room, message }) => {
        try {
            const newMessage = new GroupMessage({
                from_user: username,
                room,
                message,
                date_sent: new Date()
            });
            await newMessage.save();

            io.to(room).emit('message', {
                from_user: username,
                message: message
            });
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    // Handle typing
    socket.on('typing', ({ username, room }) => {
        // Broadcast typing event to everyone in the room except sender
        socket.to(room).emit('typing', { username });
    });

    socket.on('stopTyping', ({ room }) => {
        // Broadcast stop typing to everyone in the room except sender
        socket.to(room).emit('stopTyping');
    });

    // Handle private messages
    socket.on('privateMessage', async ({ from, to, message }) => {
        try {
            const newPrivateMessage = new PrivateMessage({
                from_user: from,
                to_user: to,
                message,
                date_sent: new Date()
            });
            await newPrivateMessage.save();

            const recipientSocketId = Array.from(users.entries())
                .find(([_, user]) => user.username === to)?.[0];

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('privateMessage', {
                    from,
                    message
                });
            }

            socket.emit('privateMessage', {
                to,
                message
            });
        } catch (error) {
            console.error('Error with private message:', error);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            io.to(user.room).emit('message', {
                from_user: 'ChatBot',
                message: `${user.username} has left the chat`
            });

            users.delete(socket.id);
            
            // Update user list
            const roomUsers = Array.from(users.values())
                .filter(u => u.room === user.room)
                .map(u => u.username);
            io.to(user.room).emit('roomUsers', roomUsers);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 