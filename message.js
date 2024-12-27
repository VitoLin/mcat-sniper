"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
require("dotenv").config({ path: "./secrets.env" });
var axios = require("axios");
// Your Webhook URL
var webhookUrl = process.env.WEBHOOK_URL;
function sendMessage(message_content) {
    var message = {
        text: message_content,
    };
    axios
        .post(webhookUrl, message)
        .then(function (response) {
        console.log("Message sent: ", response.status);
    })
        .catch(function (error) {
        console.error("Error sending message:", error);
    });
}
// sendMessage("Hello, World!");
