require("dotenv").config({ path: "./secrets.env" });

const axios = require("axios");

// Your Webhook URL
const webhookUrl = process.env.WEBHOOK_URL;

export function sendMessage(message_content) {
    const message = {
        text: message_content,
    };

    axios
        .post(webhookUrl, message)
        .then((response) => {
            console.log("Message sent: ", response.status);
        })
        .catch((error) => {
            console.error("Error sending message:", error);
        });
}
