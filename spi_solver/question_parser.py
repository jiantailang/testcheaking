import re
from dataclasses import dataclass, field
from typing import List, Optional
from bs4 import BeautifulSoup
from playwright.sync_api import Page

# Question type IDs
CALC = "CALC"
PROBABILITY = "PROBABILITY"
SYNONYM = "SYNONYM"
READING = "READING"
FILL = "FILL"
SEQUENCE = "SEQUENCE"
UNKNOWN = "UNKNOWN"

_PROBABILITY_RE = re.compile(r"確率|何通り|場合の数|組み合わせ|順列")
_SYNONYM_RE = re.compile(r"意味として正しい|同じ意味|同義|類義|反意|反対の意味")
_READING_RE = re.compile(r"筆者の主張|本文の内容|文章の要旨|次の文章を読ん|下線部")
_FILL_RE = re.compile(r"（\s*　\s*）|（\s*\)\s*）|\(\s*\s*\)|___+|\[　\]|\[空欄\]")
_SEQUENCE_RE = re.compile(r"^[A-E][．.、]\s|並べ替え|正しい順序")
_NUMBER_RE = re.compile(r"\d")


@dataclass
class Question:
    text: str
    choices: List[str] = field(default_factory=list)
    q_type: str = UNKNOWN
    q_number: Optional[int] = None
    q_total: Optional[int] = None


def _detect_type(text: str, choices: List[str]) -> str:
    if _FILL_RE.search(text):
        return FILL
    if _PROBABILITY_RE.search(text):
        return PROBABILITY
    if _SYNONYM_RE.search(text):
        return SYNONYM
    if _READING_RE.search(text):
        return READING
    if choices and all(_SEQUENCE_RE.match(c) for c in choices):
        return SEQUENCE
    if _NUMBER_RE.search(text):
        return CALC
    return UNKNOWN


def _extract_progress(page: Page):
    """Return (current, total) question numbers if detectable."""
    for pattern in [r"(\d+)\s*/\s*(\d+)", r"第(\d+)問.*全(\d+)問"]:
        try:
            text = page.inner_text("body")
            m = re.search(pattern, text)
            if m:
                return int(m.group(1)), int(m.group(2))
        except Exception:
            pass
    return None, None


def parse(page: Page) -> Question:
    """Extract question text, choices, and type from the current page."""
    html = page.content()
    soup = BeautifulSoup(html, "html.parser")

    # Question text — try common class names / roles
    q_text = ""
    for selector in [
        "[class*='question']",
        "[class*='mondai']",
        "[class*='problem']",
        "p.question",
        ".q-text",
        "h2",
        "h3",
    ]:
        el = soup.select_one(selector)
        if el and el.get_text(strip=True):
            q_text = el.get_text(separator=" ", strip=True)
            break

    if not q_text:
        # Fallback: largest <p> block
        paragraphs = sorted(soup.find_all("p"), key=lambda p: len(p.get_text()), reverse=True)
        q_text = paragraphs[0].get_text(separator=" ", strip=True) if paragraphs else ""

    # Choices — radio/checkbox labels or list items
    choices: List[str] = []
    for inp in soup.find_all("input", type=lambda t: t in ("radio", "checkbox")):
        label = soup.find("label", {"for": inp.get("id")})
        if label:
            choices.append(label.get_text(strip=True))
        elif inp.get("value"):
            choices.append(inp["value"])

    if not choices:
        for li in soup.select("ul.choices li, ol.choices li, .choice-list li, [class*='choice'] li"):
            txt = li.get_text(strip=True)
            if txt:
                choices.append(txt)

    q_type = _detect_type(q_text, choices)
    q_num, q_total = _extract_progress(page)

    return Question(text=q_text, choices=choices, q_type=q_type, q_number=q_num, q_total=q_total)
