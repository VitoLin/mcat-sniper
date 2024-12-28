"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var message_1 = require("./message");
var firefox = require("playwright").firefox;
require("dotenv").config({ path: "./secrets.env" });
var username = process.env.MCAT_USERNAME;
var password = process.env.MCAT_PASSWORD;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var browser, context, cookies, page, _a, error_1, timestamp, screenshotPath;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, firefox.launch({ headless: false })];
            case 1:
                browser = _b.sent();
                return [4 /*yield*/, browser.newContext({ storageState: "./auth.json" })];
            case 2:
                context = _b.sent();
                return [4 /*yield*/, context.cookies()];
            case 3:
                cookies = _b.sent();
                return [4 /*yield*/, context.newPage()];
            case 4:
                page = _b.sent();
                return [4 /*yield*/, addStealth(context)];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6:
                _b.trys.push([6, 45, , 48]);
                return [4 /*yield*/, page.goto("https://students-residents.aamc.org/register-mcat-exam/register-mcat-exam")];
            case 7:
                _b.sent();
                return [4 /*yield*/, page
                        .getByRole("link", { name: "Register for the MCAT Exam" })
                        .click()];
            case 8:
                _b.sent();
                return [4 /*yield*/, randomTimeout(1000, 2000)];
            case 9:
                _b.sent();
                return [4 /*yield*/, page.waitForLoadState("domcontentloaded")];
            case 10:
                _b.sent();
                return [4 /*yield*/, randomTimeout(5000, 6000)];
            case 11:
                _b.sent();
                if (!page.url().includes("login")) return [3 /*break*/, 19];
                return [4 /*yield*/, page.getByPlaceholder("Enter User Name").fill(username)];
            case 12:
                _b.sent();
                return [4 /*yield*/, randomTimeout(1000, 2000)];
            case 13:
                _b.sent();
                return [4 /*yield*/, page.getByPlaceholder("Enter Password").fill(password)];
            case 14:
                _b.sent();
                return [4 /*yield*/, randomTimeout(1000, 2000)];
            case 15:
                _b.sent();
                return [4 /*yield*/, page.getByRole("button", { name: "Sign In" }).click()];
            case 16:
                _b.sent();
                return [4 /*yield*/, page.waitForLoadState("domcontentloaded")];
            case 17:
                _b.sent();
                return [4 /*yield*/, randomTimeout(3000, 5000)];
            case 18:
                _b.sent();
                _b.label = 19;
            case 19: return [4 /*yield*/, page.getByRole("button", { name: "Schedule an Exam" }).click()];
            case 20:
                _b.sent();
                return [4 /*yield*/, randomTimeout(1000, 2000)];
            case 21:
                _b.sent();
                return [4 /*yield*/, page.getByRole("button", { name: "Agree" }).click()];
            case 22:
                _b.sent();
                return [4 /*yield*/, randomTimeout(1000, 2000)];
            case 23:
                _b.sent();
                return [4 /*yield*/, page.getByRole("img", { name: "Click for calendar" }).click()];
            case 24:
                _b.sent();
                return [4 /*yield*/, randomTimeout(1000, 2000)];
            case 25:
                _b.sent();
                if (!page.getByRole("button", { name: "> Next Month, February" })) return [3 /*break*/, 28];
                return [4 /*yield*/, page
                        .getByRole("button", { name: "> Next Month, February" })
                        .click()];
            case 26:
                _b.sent();
                return [4 /*yield*/, randomTimeout(1000, 2000)];
            case 27:
                _b.sent();
                _b.label = 28;
            case 28:
                if (!page.getByRole("button", { name: "> Next Month, March" })) return [3 /*break*/, 31];
                return [4 /*yield*/, page
                        .getByRole("button", { name: "> Next Month, March" })
                        .click()];
            case 29:
                _b.sent();
                return [4 /*yield*/, randomTimeout(1000, 2000)];
            case 30:
                _b.sent();
                _b.label = 31;
            case 31: return [4 /*yield*/, page.getByLabel("Friday 21st of March 2025").click()];
            case 32:
                _b.sent();
                return [4 /*yield*/, randomTimeout(1000, 2000)];
            case 33:
                _b.sent();
                _b.label = 34;
            case 34:
                if (!true) return [3 /*break*/, 44];
                return [4 /*yield*/, page.getByRole("button", { name: "Search" }).click()];
            case 35:
                _b.sent();
                return [4 /*yield*/, randomTimeout(1000, 2000)];
            case 36:
                _b.sent();
                return [4 /*yield*/, page.waitForLoadState("domcontentloaded")];
            case 37:
                _b.sent();
                return [4 /*yield*/, randomTimeout(2000, 3000)];
            case 38:
                _b.sent();
                return [4 /*yield*/, context.storageState({ path: "auth.json" })];
            case 39:
                _b.sent();
                return [4 /*yield*/, page.locator("#testCenter_0").innerText()];
            case 40:
                _a = !(_b.sent()).includes("None available");
                if (_a) return [3 /*break*/, 42];
                return [4 /*yield*/, page.locator("#testCenter_1").innerText()];
            case 41:
                _a = !(_b.sent()).includes("None available");
                _b.label = 42;
            case 42:
                if (_a) {
                    (0, message_1.sendMessage)("MCAT Test Centers Available!");
                }
                else {
                    console.log("No MCAT Test Centers Available");
                }
                return [4 /*yield*/, randomTimeout(60000, 120000)];
            case 43:
                _b.sent();
                return [3 /*break*/, 34];
            case 44: return [3 /*break*/, 48];
            case 45:
                error_1 = _b.sent();
                console.error("An error occurred:", error_1);
                timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                screenshotPath = "error-screenshot-".concat(timestamp, ".png");
                return [4 /*yield*/, page.screenshot({ path: screenshotPath })];
            case 46:
                _b.sent();
                console.log("Screenshot saved: ".concat(screenshotPath));
                // Optional: Close browser after error
                return [4 /*yield*/, browser.close()];
            case 47:
                // Optional: Close browser after error
                _b.sent();
                return [3 /*break*/, 48];
            case 48: return [2 /*return*/];
        }
    });
}); })();
function addStealth(context) {
    return __awaiter(this, void 0, void 0, function () {
        var enabledEvasions, evasions, stealth, _i, _a, evasion;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    enabledEvasions = [
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
                    evasions = enabledEvasions.map(function (e) {
                        return require("puppeteer-extra-plugin-stealth/evasions/".concat(e));
                    });
                    stealth = {
                        callbacks: [],
                        evaluateOnNewDocument: function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    this.callbacks.push({ cb: args[0], a: args[1] });
                                    return [2 /*return*/];
                                });
                            });
                        },
                    };
                    evasions.forEach(function (e) { return e().onPageCreated(stealth); });
                    _i = 0, _a = stealth.callbacks;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    evasion = _a[_i];
                    return [4 /*yield*/, context.addInitScript(evasion.cb, evasion.a)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function randomTimeout(min, max) {
    return new Promise(function (resolve) {
        return setTimeout(resolve, Math.random() * (max - min) + min);
    });
}
