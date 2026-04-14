import { BrowserContext, Page } from "playwright";
import * as readline from "readline";
import { sendMessage } from "./message";

export async function handleCookieBanner(page: Page) {
    // Check for OneTrust cookie banner and accept cookies for 20 seconds
    const acceptBtn = page.locator("#onetrust-accept-btn-handler");
    const startTime = Date.now();
    const duration = 5000;

    while (Date.now() - startTime < duration) {
        if (await acceptBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log("Cookie banner detected, clicking Allow and Continue...");
            await acceptBtn.click();
            console.log("Cookie banner accepted");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
}

export async function goToSchedule(page: Page) {
    await page.goto(
        "https://students-residents.aamc.org/register-mcat-exam/register-mcat-exam"
    );
    await page.waitForLoadState("domcontentloaded");
    await page
        .getByRole("link", { name: "Register for the MCAT Exam" })
        .click();

    await page.waitForURL(
        (url) => url.href.includes("login") || url.href.includes("dashboard"),
        { timeout: 10000 }
    );
}

export async function goToExamSearch(page: Page) {
    await page.getByRole("button", { name: "Schedule an Exam" }).waitFor({ state: "visible", timeout: 30000 });
    await page.getByRole("button", { name: "Schedule an Exam" }).click();

    await page.getByRole("button", { name: "Agree" }).waitFor({ state: "visible", timeout: 30000 });
    await page.getByRole("button", { name: "Agree" }).click();

    await page.waitForURL((url) => url.href.includes("SelectTestCenterAndDateProximity"), { timeout: 30000 });
}

async function promptUserForCode(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question("Enter your 6-digit 2FA code: ", (answer) => {
            rl.close();
            const code = answer.trim().replace(/\s/g, "");
            if (code.length !== 6 || !/^\d+$/.test(code)) {
                console.error("Invalid code. Please enter exactly 6 digits.");
                return promptUserForCode().then(resolve);
            }
            resolve(code);
        });
    });
}

export async function handle2FA(page: Page) {
    // Click Continue to send the code
    const continueButton = page.getByRole("button", { name: "Continue" });
    if (await continueButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await continueButton.click();
    }

    // Wait for the code input page
    await page.getByRole("heading", { name: "Enter Your One-time Code" }).waitFor({ timeout: 30000 });

    // Check "Trust this device for 30 days" to avoid 2FA on future runs
    const trustCheckbox = page.getByRole("checkbox", { name: /Trust this computer or device for 30 days/i });
    if (await trustCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
        await trustCheckbox.check();
        console.log("Trusting this device for 30 days");
    }

    // Prompt user for the code
    const code = await promptUserForCode();

    // Enter code into the 6 textboxes
    const codeInputs = page.locator('input[aria-label*="One-Time-Code"]');
    const count = await codeInputs.count();

    for (let i = 0; i < Math.min(count, code.length); i++) {
        await codeInputs.nth(i).fill(code[i]);
    }

    // Click Authenticate button
    await page.getByRole("button", { name: "Authenticate" }).click();
}

export async function attemptLogin(
    page: Page,
    username: string,
    password: string
) {
    await page.waitForLoadState("domcontentloaded");
    await page.getByPlaceholder("Enter User Name").waitFor({ state: "visible", timeout: 30000 });
    await page.getByPlaceholder("Enter User Name").fill(username);

    await page.getByPlaceholder("Enter Password").waitFor({ state: "visible", timeout: 5000 });
    await page.getByPlaceholder("Enter Password").fill(password);

    await page.getByRole("button", { name: "Sign In" }).waitFor({ state: "visible", timeout: 5000 });
    await page.getByRole("button", { name: "Sign In" }).click();

    // Check for 2FA page
    const twoFactorHeading = page.getByRole("heading", { name: "Two-Factor Authentication" });
    if (await twoFactorHeading.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log("2FA detected - please check your email for a code");
        await handle2FA(page);
    }

    await page.waitForURL((url) => url.href.includes("dashboard"), { timeout: 30000 });

    await saveAuth(page.context());
}

export async function searchForExam(
    page: Page,
    day: string,
    month: string,
    year: string,
    address: string
) {
    await handleCookieBanner(page);

    if (address != "") {
        await page.getByPlaceholder("Search by address").waitFor({ state: "visible", timeout: 30000 });
        await page.getByPlaceholder("Search by address").fill(address);
    }

    await page.getByRole("img", { name: "Click for calendar" }).click();

    let currentMonth: string =
        (await page.locator("span.ui-datepicker-month").innerText()) || "";

    while (!currentMonth.includes(month)) {
        await page.getByRole("button", { name: "> Next Month" }).waitFor({ state: "visible", timeout: 5000 });
        await page.getByRole("button", { name: "> Next Month" }).click();

        currentMonth =
            (await page.locator("span.ui-datepicker-month").innerText()) || "";
    }

    // Build the expected aria-label
    const dateObj = new Date(`${month} ${day}, ${year}`);
    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    // Format day with ordinal suffix
    function ordinal(n: number) {
        const s = ["th", "st", "nd", "rd"],
            v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }
    const dayWithSuffix = ordinal(Number(day));
    const ariaLabel = `${weekday} ${dayWithSuffix} of ${month} ${year} Available`;

    const dateButton = page.getByRole("button", { name: ariaLabel });
    if (await dateButton.count() === 0) {
        throw new Error(
            `No available date button found for aria-label: ${ariaLabel}`
        );
    }
    await dateButton.first().waitFor({ state: "visible", timeout: 5000 });
    await dateButton.first().click();
}

export async function keepSearching(
    page: Page,
    minTimeout: number,
    maxTimeout: number,
    numTopCloses: number
) {
    const searchButton = page.locator("#addressSearch");
    await searchButton.waitFor({ state: "visible", timeout: 30000 });
    await searchButton.scrollIntoViewIfNeeded();
    await searchButton.click();
    await page.waitForLoadState("domcontentloaded");

    await page.context().storageState({ path: "auth.json" });

    let available = false;
    for (let i = 0; i < numTopCloses; i++) {
        console.log("Checking test center: ", i);
        if (
            !(await page.locator(`#testCenter_${i}`).innerText()).includes(
                "None available"
            )
        ) {
            available = true;
            break;
        } else {
            console.log("Test Center ", i, " is not available");
        }
    }

    if (available) {
        console.log("MCAT Test Centers Available!");
        sendMessage("MCAT Test Centers Available!");
    } else {
        console.log("No MCAT Test Centers Available");
    }
    await randomTimeout(minTimeout, maxTimeout);
}

async function saveAuth(context: BrowserContext) {
    await context.storageState({ path: "auth.json" });
}

export function randomTimeout(min: number, max: number) {
    return new Promise((resolve) =>
        setTimeout(resolve, Math.random() * (max - min) + min)
    );
}
