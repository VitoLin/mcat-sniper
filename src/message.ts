import * as dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: "./secrets.env" });

// Your Webhook URL
const webhookUrl = process.env.WEBHOOK_URL;

export function sendMessage(message_content: string) {
    const message = {
        content: message_content,
    };

    if (!webhookUrl) {
        console.error("WEBHOOK_URL is not defined in environment variables.");
        return;
    }

    axios
        .post(webhookUrl, message)
        .then((response: any) => {
            console.log("Message sent: ", response.status);
        })
        .catch((error: any) => {
            console.error("Error sending message:", error);
        });
}
