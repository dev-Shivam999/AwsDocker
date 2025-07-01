import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";

// Create an Express application
const app = express();

// Enable CORS for all origins (customize as needed)
app.use(cors({
    origin: process.env.ClientUrl, // or use '*' for all
    methods: ['GET', 'POST'],
    credentials: true
}));

// Define a simple route for HTTP requests
app.get('/', (req, res) => {
    res.send("Hello from Express server");
});

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Set up the WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on('message', function message(data, isBinary) {
        // Broadcast the message to all clients
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data, { binary: isBinary });
            }
        });
    });

    // Send a message to the client when connected
    ws.send('Hello from WebSocket');
});

// MongoDB Connection
const mongoURI = process.env.DB_URL??""; // Replace with your URI
mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB");

        // Start the HTTP and WebSocket server only after DB connection
        server.listen(3001, () => {
            console.log("Server is running on http://localhost:3000");
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });
