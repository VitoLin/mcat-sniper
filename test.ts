import { userInfo } from "os";
import { sendMessage } from "./message";
const { firefox } = require("playwright");

require("dotenv").config({ path: "./secrets.env" });

const username = process.env.MCAT_USERNAME;
const password = process.env.MCAT_PASSWORD;

(async () => {
    const browser = await firefox.launch({ headless: false });
    const context = await browser.newContext({ storageState: "./auth.json" });
    const cookies = await context.cookies();
    const page = await context.newPage();

    await addStealth(context);

    await page.goto(
        "https://students-residents.aamc.org/register-mcat-exam/register-mcat-exam"
    );
    await page
        .getByRole("link", { name: "Register for the MCAT Exam" })
        .click();
    await randomTimeout(1000, 2000);

    await page.waitForLoadState("domcontentloaded");
    if (page.url().includes("login")) {
        await page.getByPlaceholder("Enter User Name").fill(username);
        await randomTimeout(1000, 2000);
        await page.getByPlaceholder("Enter Password").fill(password);
        await randomTimeout(1000, 2000);
        await page.getByRole("button", { name: "Sign In" }).click();
        await page.waitForLoadState("domcontentloaded");
        await randomTimeout(3000, 5000);
    }

    await page.getByRole("button", { name: "Schedule an Exam" }).click();
    await randomTimeout(1000, 2000);
    await page.getByRole("button", { name: "Agree" }).click();
    await randomTimeout(1000, 2000);

    await page.getByRole("img", { name: "Click for calendar" }).click();
    await randomTimeout(1000, 2000);

    if (page.getByRole("button", { name: "> Next Month, February" })) {
        await page
            .getByRole("button", { name: "> Next Month, February" })
            .click();
        await randomTimeout(1000, 2000);
    }
    if (page.getByRole("button", { name: "> Next Month, March" })) {
        await page.getByRole("button", { name: "> Next Month, March" }).click();
        await randomTimeout(1000, 2000);
    }

    await page.getByLabel("Friday 21st of March 2025").click();
    await randomTimeout(1000, 2000);

    while (true) {
        await page.getByRole("button", { name: "Search" }).click();
        await randomTimeout(1000, 2000);

        await page.waitForLoadState("domcontentloaded");
        await randomTimeout(2000, 3000);

        await context.storageState({ path: "auth.json" });

        if (
            !(await page.locator("#testCenter_0").innerText()).includes(
                "None available"
            ) ||
            !(await page.locator("#testCenter_1").innerText()).includes(
                "None available"
            )
        ) {
            sendMessage("MCAT Test Centers Available!");
        } else {
            console.log("No MCAT Test Centers Available");
        }
        await randomTimeout(60000, 120000);
    }
})();

async function addStealth(context) {
    const enabledEvasions = [
        "chrome.app",
        "chrome.csi",
        "chrome.loadTimes",
        "chrome.runtime",
        "iframe.contentWindow",
        "media.codecs",
        "navigator.hardwareConcurrency",
        "navigator.languages",
        "navigator.permissions",
        "navigator.plugins",
        "navigator.webdriver",
        "sourceurl",
        "webgl.vendor",
        "window.outerdimensions",
    ];
    const evasions = enabledEvasions.map((e) =>
        require(`puppeteer-extra-plugin-stealth/evasions/${e}`)
    );
    const stealth = {
        callbacks: [] as { cb: Function; a: any }[],
        async evaluateOnNewDocument(...args) {
            this.callbacks.push({ cb: args[0], a: args[1] });
        },
    };
    evasions.forEach((e) => e().onPageCreated(stealth));
    for (let evasion of stealth.callbacks) {
        await context.addInitScript(evasion.cb, evasion.a);
    }
}

function randomTimeout(min, max) {
    return new Promise((resolve) =>
        setTimeout(resolve, Math.random() * (max - min) + min)
    );
}
