import { BrowserContext, firefox } from "playwright";
import {
    goToExamSearch,
    goToSchedule,
    attemptLogin,
    searchForExam,
    keepSearching,
} from "./aamcLib";

require("dotenv").config({ path: "./secrets.env" });

const username: string = process.env.MCAT_USERNAME || "";
const password: string = process.env.MCAT_PASSWORD || "";
const address: string = process.env.MCAT_ADDRESS || "";

const day: string = process.env.MCAT_DAY || "";
const month: string = process.env.MCAT_MONTH || "";
const year: string = process.env.MCAT_YEAR || "";

const minimumMinutesBeforeChecking: number = 1;
const maximumMinutesBeforeChecking: number = 2;
const topClosest: number = 2;

export async function checkMCATExam(
    day: string,
    month: string,
    year: string,
    minimumMinutesBeforeChecking: number,
    maximumMinutesBeforeChecking: number,
    topCloses: number
) {
    while (true) {
        const browser = await firefox.launch({ headless: true });
        const context = await browser.newContext({
            storageState: "./auth.json",
        });
        const page = await context.newPage();

        await addStealth(context);
        try {
            await goToSchedule(page);

            // Check if already logged in, if not, attempt to login
            if (page.url().includes("dashboard")) {
                console.log("Already logged in");
            } else if (await page.url().includes("login")) {
                console.log("Logging in");
                attemptLogin(page, username, password);
            } else {
                console.log("Error: Not on the expected page");
                return -1;
            }

            await goToExamSearch(page);

            await searchForExam(page, day, month, year, address);

            while (true) {
                await keepSearching(
                    page,
                    minimumMinutesBeforeChecking * 60000,
                    maximumMinutesBeforeChecking * 60000,
                    topCloses
                );
            }
        } catch (error) {
            console.error("An error occurred:", error);

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const screenshotPath = `error-screenshot-${timestamp}.png`;
            await page.screenshot({ path: screenshotPath });
            console.log(`Screenshot saved: ${screenshotPath}`);
        }
    }
}

async function addStealth(context: BrowserContext) {
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
        async evaluateOnNewDocument(...args: any[]) {
            this.callbacks.push({ cb: args[0], a: args[1] });
        },
    };
    evasions.forEach((e) => e().onPageCreated(stealth));
    for (let evasion of stealth.callbacks) {
        await context.addInitScript(evasion.cb as any, evasion.a);
    }
}
console.log("Loaded MCAT date from env:", { day, month, year });

checkMCATExam(
    day,
    month,
    year,
    minimumMinutesBeforeChecking,
    maximumMinutesBeforeChecking,
    topClosest
);
