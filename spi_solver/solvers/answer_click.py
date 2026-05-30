"""Handle all answer submission interactions with the browser page."""

import re
from playwright.sync_api import Page
from utils.wait_helper import human_wait

_NEXT_TEXTS = ["次の問題", "次へ", "Next", "NEXT", "進む", "次問"]


def _find_next_button(page: Page):
    for text in _NEXT_TEXTS:
        btn = page.get_by_role("button", name=re.compile(text, re.IGNORECASE))
        if btn.count() > 0:
            return btn.first
        link = page.get_by_role("link", name=re.compile(text, re.IGNORECASE))
        if link.count() > 0:
            return link.first
    return None


def select_radio(page: Page, answer: str) -> bool:
    """Click a radio button whose value or label matches *answer*."""
    # Try value attribute first
    loc = page.locator(f'input[type="radio"][value="{answer}"]')
    if loc.count() > 0:
        loc.first.click()
        human_wait()
        return True

    # Try label text match
    label = page.get_by_text(answer, exact=False)
    if label.count() > 0:
        label.first.click()
        human_wait()
        return True

    return False


def select_checkbox(page: Page, answers: list) -> None:
    """Select multiple checkboxes by value or label text."""
    for answer in answers:
        loc = page.locator(f'input[type="checkbox"][value="{answer}"]')
        if loc.count() > 0:
            loc.first.check()
        else:
            page.get_by_text(answer, exact=False).first.click()
        human_wait(0.3, 0.8)


def fill_text(page: Page, selector: str, answer_text: str) -> None:
    """Type answer into a text input."""
    page.fill(selector, answer_text)
    human_wait()


def click_answer(page: Page, answer: str) -> bool:
    """
    Generic answer selection: try radio → label text click.
    Returns True if an element was clicked.
    """
    if select_radio(page, answer):
        return True

    # Fallback: click any visible element whose text matches
    el = page.get_by_text(answer, exact=True)
    if el.count() > 0:
        el.first.click()
        human_wait()
        return True

    return False


def click_next(page: Page) -> bool:
    """Press the 'next question' button. Returns True on success."""
    btn = _find_next_button(page)
    if btn:
        btn.click()
        human_wait()
        return True
    return False
