const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { Expo } = require("expo-server-sdk");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const Notice = require("./models/notice.js");
require("./config/db");

const expo = new Expo();
const pushTokens = new Set(); // Using Set to automatically handle duplicates

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Helper function to send push notifications
const sendPushNotifications = async (title, body) => {
    if (pushTokens.size === 0) return;

    const messages = Array.from(pushTokens)
        .filter(token => Expo.isExpoPushToken(token))
        .map(token => ({
            to: token,
            sound: 'default',
            title,
            body,
            priority: 'high',
            channelId: 'default',
        }));

    if (messages.length === 0) return;

    try {
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];
        
        for (let chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error('Error sending chunk:', error);
            }
        }

        // Handle receipts if needed
        const receiptIds = tickets
            .filter(ticket => ticket.id)
            .map(ticket => ticket.id);

        if (receiptIds.length > 0) {
            const receiptChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
            for (let chunk of receiptChunks) {
                try {
                    const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                    for (let receiptId in receipts) {
                        const { status, message, details } = receipts[receiptId];
                        if (status === 'error') {
                            console.error(`Error for receipt ${receiptId}:`, message);
                        }
                    }
                } catch (error) {
                    console.error('Error getting receipts:', error);
                }
            }
        }
    } catch (error) {
        console.error('Error in sendPushNotifications:', error);
    }
};

// Socket.io setup
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle push token registration
    socket.on('register_push_token', (token) => {
        if (Expo.isExpoPushToken(token)) {
            pushTokens.add(token);
            console.log('Push token registered:', token);
        }
    });

    // Fetch notices
    socket.on("fetch_notices", async () => {
        try {
            const notices = await Notice.find().sort({ date: -1 });
            socket.emit("notices", notices);
        } catch (error) {
            console.error("Error fetching notices:", error);
            socket.emit("error", { message: "Failed to fetch notices" });
        }
    });

    // Add notice
    socket.on("add_notice", async (data) => {
        try {
            const newNotice = new Notice(data);
            await newNotice.save();
            io.emit("notice_added", newNotice);
            
            // Send notification
            await sendPushNotifications(
                'New Notice',
                `${newNotice.title}`
            );
        } catch (error) {
            console.error("Error adding notice:", error);
            socket.emit("error", { message: "Failed to add notice" });
        }
    });

    // Edit notice
    socket.on("edit_notice", async (data) => {
        try {
            const { id, ...updateData } = data;
            const updatedNotice = await Notice.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );
            
            if (updatedNotice) {
                io.emit("notice_updated", updatedNotice);
                await sendPushNotifications(
                    'Notice Updated',
                    `${updatedNotice.title} has been updated.`
                );
            }
        } catch (error) {
            console.error("Error updating notice:", error);
            socket.emit("error", { message: "Failed to update notice" });
        }
    });

    // Delete notice
    socket.on("delete_notice", async (id) => {
        try {
            const deletedNotice = await Notice.findByIdAndDelete(id);
            if (deletedNotice) {
                io.emit("notice_deleted", id);
            }
        } catch (error) {
            console.error("Error deleting notice:", error);
            socket.emit("error", { message: "Failed to delete notice" });
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;