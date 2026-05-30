import random
import time
from config import WAIT_MIN, WAIT_MAX


def human_wait(min_sec: float = WAIT_MIN, max_sec: float = WAIT_MAX) -> None:
    """Sleep for a random duration to mimic human interaction speed."""
    duration = random.uniform(min_sec, max_sec)
    time.sleep(duration)


def wait_for_element(page, selector: str, timeout: int = 10000):
    """Wait for a CSS selector to appear and return the locator."""
    locator = page.locator(selector)
    locator.wait_for(state="visible", timeout=timeout)
    return locator


def retry(func, max_retries: int = 3, delay: float = 2.0):
    """Retry wrapper with exponential backoff."""
    last_exc = None
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as exc:
            last_exc = exc
            wait = delay * (2 ** attempt)
            time.sleep(wait)
    raise last_exc
