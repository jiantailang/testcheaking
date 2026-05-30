import os
from playwright.sync_api import sync_playwright, Page, Browser
from config import HEADLESS, BROWSER_TIMEOUT, SCREENSHOT_DIR


class BrowserController:
    def __init__(self):
        self._playwright = None
        self._browser: Browser = None
        self.page: Page = None

    def start(self) -> Page:
        self._playwright = sync_playwright().start()
        self._browser = self._playwright.chromium.launch(headless=HEADLESS)
        self.page = self._browser.new_page()
        self.page.set_default_timeout(BROWSER_TIMEOUT)
        return self.page

    def goto(self, url: str) -> None:
        self.page.goto(url)
        self.page.wait_for_load_state("networkidle")

    def screenshot(self, name: str) -> str:
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
        self.page.screenshot(path=path)
        return path

    def close(self) -> None:
        if self._browser:
            self._browser.close()
        if self._playwright:
            self._playwright.stop()
