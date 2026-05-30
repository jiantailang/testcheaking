"""Language-type question solver (SYNONYM, FILL, SEQUENCE, READING)."""

import difflib
import re
from typing import List


def _similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, a, b).ratio()


def _ngrams(text: str, n: int = 2) -> List[str]:
    return [text[i : i + n] for i in range(len(text) - n + 1)]


def _ngram_score(query: str, candidate: str, n: int = 2) -> float:
    q_grams = set(_ngrams(query, n))
    c_grams = set(_ngrams(candidate, n))
    if not q_grams:
        return 0.0
    return len(q_grams & c_grams) / len(q_grams)


# ---------------------------------------------------------------------------
# Public solvers
# ---------------------------------------------------------------------------

def solve_synonym(text: str, choices: List[str]) -> str:
    """
    Pick the choice most similar to the keyword extracted from the question.
    Keyword is the quoted or underlined term (「…」 / 『…』 / 下線部).
    """
    # Extract target keyword from 「...」 or 『...』
    m = re.search(r"[「『]([^」』]+)[」』]", text)
    keyword = m.group(1) if m else text

    best = choices[0] if choices else ""
    best_score = -1.0
    for c in choices:
        score = _similarity(keyword, c)
        if score > best_score:
            best_score = score
            best = c
    return best


def solve_fill(text: str, choices: List[str]) -> str:
    """
    Choose the option that makes the sentence most fluent using n-gram scoring.
    The blank marker is replaced by each choice and the best fit is returned.
    """
    blank_re = re.compile(r"（\s*　\s*）|（\s*\)\s*）|\(\s*\)|\[　\]|___+")

    best = choices[0] if choices else ""
    best_score = -1.0
    for c in choices:
        filled = blank_re.sub(c, text, count=1)
        score = _ngram_score(text, filled, n=2) + _similarity(text, filled) * 0.5
        if score > best_score:
            best_score = score
            best = c
    return best


def solve_sequence(text: str, choices: List[str]) -> str:
    """
    For reordering questions, score each choice by how grammatically natural
    the resulting sentence sounds (simple bigram heuristic).
    """
    # Choices are typically labels like "A→B→C→D→E"; score by n-gram overlap
    # with the surrounding context sentences.
    context = re.sub(r"[A-E][．.、→]", "", text)

    best = choices[0] if choices else ""
    best_score = -1.0
    for c in choices:
        # Expand letter sequence to text tokens if possible
        candidate_text = re.sub(r"[^A-Eあ-ん一-鿿]", "", c)
        score = _ngram_score(context, c, n=1)
        if score > best_score:
            best_score = score
            best = c
    return best


def solve_reading(text: str, choices: List[str]) -> str:
    """
    For reading comprehension, pick the choice with highest overall similarity
    to the passage text (surface-level heuristic).
    """
    best = choices[0] if choices else ""
    best_score = -1.0
    for c in choices:
        score = _similarity(text, c) + _ngram_score(text, c, n=3) * 0.5
        if score > best_score:
            best_score = score
            best = c
    return best
