const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

// Set up Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set up Mongoose
mongoose.connect('mongodb://localhost:27017/domains', { useNewUrlParser: true, useUnifiedTopology: true });

const domainSchema = new mongoose.Schema({
    domain: String,
    isp: String,
    status: String
});

const Domain = mongoose.model('Domain', domainSchema);

// Middleware to parse JSON
app.use(express.json());

// Endpoint to receive JSON data
app.post('/update', async (req, res) => {
    const { domain, isp, status } = req.body;
    const updatedDomain = await Domain.findOneAndUpdate(
        { domain },
        { isp, status },
        { upsert: true, new: true }
    );
    console.log('Emitting statusUpdate:', updatedDomain); // Log emitted data
    io.emit('statusUpdate', updatedDomain);
    res.status(200).send(updatedDomain);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Serve static files for the frontend
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
