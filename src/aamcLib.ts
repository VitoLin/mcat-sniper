import { BrowserContext, Page } from "playwright";
import { sendMessage } from "./message";

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
    await page.getByRole("button", { name: "Schedule an Exam" }).isVisible();
    await page.getByRole("button", { name: "Schedule an Exam" }).click();

    await page.getByRole("button", { name: "Agree" }).isVisible();
    await page.getByRole("button", { name: "Agree" }).click();

    await page.url().includes("SelectTestCenterAndDateProximity");
}

export async function attemptLogin(
    page: Page,
    username: string,
    password: string
) {
    await page.waitForLoadState("domcontentloaded");
    await page.getByPlaceholder("Enter User Name").isVisible();
    await page.getByPlaceholder("Enter User Name").fill(username);

    await page.getByPlaceholder("Enter Password").isVisible();
    await page.getByPlaceholder("Enter Password").fill(password);

    await page.getByRole("button", { name: "Sign In" }).isVisible();
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.url().includes("dashboard");

    saveAuth(page.context());
}

export async function searchForExam(
    page: Page,
    day: string,
    month: string,
    year: string,
    address: string
) {
    if (address != "") {
        await page.getByPlaceholder("Search by address").isVisible();
        await page.getByPlaceholder("Search by address").fill(address);
    }

    await page.getByRole("img", { name: "Click for calendar" }).click();

    let currentMonth: string =
        (await page.locator("span.ui-datepicker-month").innerText()) || "";

    while (!currentMonth.includes(month)) {
        await page.getByRole("button", { name: "> Next Month" }).isVisible();
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

    const dateButton = page.locator(`a[role="button"][aria-label="${ariaLabel}"]`);
    if (await dateButton.count() === 0) {
        throw new Error(
            `No available date button found for aria-label: ${ariaLabel}`
        );
    }
    await dateButton.first().isVisible();
    await dateButton.first().click();
}

export async function keepSearching(
    page: Page,
    minTimeout: number,
    maxTimeout: number,
    numTopCloses: number
) {
    await page.getByRole("button", { name: "Search" }).isVisible();
    await page.getByRole("button", { name: "Search" }).click();
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

function saveAuth(context: BrowserContext) {
    context.storageState({ path: "auth.json" });
}

export function randomTimeout(min: number, max: number) {
    return new Promise((resolve) =>
        setTimeout(resolve, Math.random() * (max - min) + min)
    );
}
