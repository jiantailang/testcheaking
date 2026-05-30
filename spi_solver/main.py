"""
Entry point for the SPI / TG-WEB / Tamatebako auto-answer system.

Usage:
    python main.py <test_url>
"""

import sys
import re
from browser_ctrl import BrowserController
from question_parser import parse, CALC, PROBABILITY, SYNONYM, READING, FILL, SEQUENCE, UNKNOWN
from solvers import math_solver, lang_matcher
from solvers.answer_click import click_answer, click_next
from utils.wait_helper import human_wait

_FINISH_PATTERNS = [
    re.compile(p) for p in [
        r"テスト終了", r"お疲れ様", r"結果", r"終了しました", r"Finished", r"Complete",
    ]
]


def _is_finished(page) -> bool:
    try:
        body = page.inner_text("body")
        return any(p.search(body) for p in _FINISH_PATTERNS)
    except Exception:
        return False


def _solve(q) -> str:
    if q.q_type in (CALC, PROBABILITY):
        return math_solver.solve(q.text, q.choices)
    if q.q_type == SYNONYM:
        return lang_matcher.solve_synonym(q.text, q.choices)
    if q.q_type == FILL:
        return lang_matcher.solve_fill(q.text, q.choices)
    if q.q_type == SEQUENCE:
        return lang_matcher.solve_sequence(q.text, q.choices)
    if q.q_type == READING:
        return lang_matcher.solve_reading(q.text, q.choices)
    # UNKNOWN: pick first choice
    return q.choices[0] if q.choices else ""


def run(url: str) -> None:
    ctrl = BrowserController()
    try:
        page = ctrl.start()
        ctrl.goto(url)

        q_index = 0
        while not _is_finished(page):
            q_index += 1
            try:
                q = parse(page)
            except Exception as exc:
                path = ctrl.screenshot(f"parse_error_q{q_index}")
                print(f"[Q{q_index}] PARSE ERROR: {exc} — screenshot: {path}")
                click_next(page)
                human_wait()
                continue

            if not q.choices:
                path = ctrl.screenshot(f"no_choices_q{q_index}")
                print(f"[Q{q_index}] NO CHOICES — screenshot: {path}")
                if not click_next(page):
                    break
                continue

            answer = _solve(q)
            q_label = f"Q{q.q_number}" if q.q_number else f"Q{q_index}"
            print(f"[{q_label}] type={q.q_type:<12} answer={answer!r:<20} choices={q.choices}")

            clicked = click_answer(page, answer)
            if not clicked:
                path = ctrl.screenshot(f"click_fail_{q_label}")
                print(f"[{q_label}] CLICK FAILED — screenshot: {path}")

            advanced = click_next(page)
            if not advanced:
                # No "next" button — check if we've finished
                if _is_finished(page):
                    break
                path = ctrl.screenshot(f"no_next_{q_label}")
                print(f"[{q_label}] NEXT BUTTON NOT FOUND — screenshot: {path}")
                break

            try:
                page.wait_for_load_state("networkidle", timeout=15000)
            except Exception:
                pass

        print("=== Test completed ===")
    finally:
        ctrl.close()


if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else ""
    if not target_url:
        print("Usage: python main.py <test_url>")
        sys.exit(1)
    run(target_url)
