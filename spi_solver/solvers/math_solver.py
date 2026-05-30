"""
Solver for numerical question types: CALC and PROBABILITY.

>>> closest_choice(12.5, ["A: 10", "B: 12.5", "C: 15"])
'B: 12.5'
>>> closest_choice(7, ["6", "7", "8"])
'7'
>>> closest_choice(3.14, ["3", "3.1", "3.2"])
'3.1'
"""

import math
import re
from fractions import Fraction
from typing import List, Optional

from config import ANSWER_TOLERANCE

_NUM_RE = re.compile(r"-?\d+(?:[./]\d+)?")


def _extract_numbers(text: str) -> List[float]:
    nums = []
    for m in _NUM_RE.findall(text):
        try:
            nums.append(float(Fraction(m)))
        except (ValueError, ZeroDivisionError):
            pass
    return nums


def _choice_value(choice: str) -> Optional[float]:
    """Parse the numeric value embedded in a choice string."""
    m = _NUM_RE.search(choice)
    if not m:
        return None
    try:
        return float(Fraction(m.group()))
    except (ValueError, ZeroDivisionError):
        return None


def closest_choice(value: float, choices: List[str]) -> str:
    """
    Return the choice whose numeric content is closest to *value*.
    Falls back to the first choice if none contain a number.

    >>> closest_choice(12.5, ["A: 10", "B: 12.5", "C: 15"])
    'B: 12.5'
    """
    best_choice = choices[0] if choices else ""
    best_diff = float("inf")
    for c in choices:
        cv = _choice_value(c)
        if cv is None:
            continue
        diff = abs(cv - value)
        if diff < best_diff:
            best_diff = diff
            best_choice = c
    return best_choice


def _is_match(value: float, choices: List[str]) -> Optional[str]:
    """Return a choice that is within ANSWER_TOLERANCE of value, or None."""
    for c in choices:
        cv = _choice_value(c)
        if cv is not None and abs(cv - value) <= ANSWER_TOLERANCE:
            return c
    return None


# ---------------------------------------------------------------------------
# Pattern matchers — each returns float or None
# ---------------------------------------------------------------------------

def _try_percentage(text: str, nums: List[float]) -> Optional[float]:
    """'XのY%は？' → X * Y / 100"""
    if "%" in text and len(nums) >= 2:
        return round(nums[0] * nums[1] / 100, 4)
    return None


def _try_discount(text: str, nums: List[float]) -> Optional[float]:
    """'X円のY割引後' → X * (1 - Y/10)"""
    if re.search(r"割引|割り引き|割引き", text) and len(nums) >= 2:
        x, y = nums[0], nums[1]
        # Y could be expressed as percentage (e.g. 20%) or wari (e.g. 2割)
        if "%" in text:
            return round(x * (1 - y / 100), 4)
        return round(x * (1 - y / 10), 4)
    return None


def _try_modulo(text: str, nums: List[float]) -> Optional[float]:
    """'XをYで割ると余りは？'"""
    if re.search(r"余り|あまり", text) and len(nums) >= 2:
        a, b = int(nums[0]), int(nums[1])
        if b != 0:
            return float(a % b)
    return None


def _try_speed(text: str, nums: List[float]) -> Optional[float]:
    """Speed / distance / time problems."""
    if re.search(r"時速.*km.*何時間|時間はいくつ", text) and len(nums) >= 2:
        # distance / speed
        return round(nums[1] / nums[0], 4)
    if re.search(r"分で.*km.*時速|時速は", text) and len(nums) >= 2:
        # Y km in X min → km/h
        return round(nums[1] / nums[0] * 60, 4)
    if re.search(r"km.*時間|時速", text) and len(nums) >= 2:
        speed, dist = nums[0], nums[1]
        # heuristic: if question asks for time → dist/speed, else speed
        if re.search(r"何時間|時間は", text):
            return round(dist / speed, 4)
        if re.search(r"何km|距離は", text):
            return round(speed * nums[1], 4)
    return None


def _try_profit(text: str, nums: List[float]) -> Optional[float]:
    """Profit / cost calculations."""
    if re.search(r"利益を乗せ|利益率|仕入れ", text) and len(nums) >= 2:
        cost, rate = nums[0], nums[1]
        return round(cost * (1 + rate / 100), 4)
    if re.search(r"定価.*引き.*利益|利益はいくら", text) and len(nums) >= 3:
        cost, list_price, discount_rate = nums[0], nums[1], nums[2]
        sale = list_price * (1 - discount_rate / 100)
        return round(sale - cost, 4)
    return None


def _try_probability(text: str, nums: List[float]) -> Optional[float]:
    """Combinatorics / probability."""
    if re.search(r"何通り|組み合わせ", text) and len(nums) >= 2:
        n, r = int(nums[0]), int(nums[1])
        if n >= r >= 0:
            return float(math.comb(n, r))
    if re.search(r"順列", text) and len(nums) >= 2:
        n, r = int(nums[0]), int(nums[1])
        return float(math.perm(n, r))
    if re.search(r"サイコロ.*回.*確率|確率", text) and len(nums) >= 2:
        rolls = int(nums[0])
        return round((1 / 6) ** rolls, 6)
    return None


def _try_set(text: str, nums: List[float]) -> Optional[float]:
    """Venn-diagram set problems: N - (A + B - both)."""
    if re.search(r"どちらでもない|両方.*除く|集合", text) and len(nums) >= 4:
        total, a, b, both = nums[0], nums[1], nums[2], nums[3]
        return float(total - (a + b - both))
    return None


_PATTERN_FUNCS = [
    _try_percentage,
    _try_discount,
    _try_modulo,
    _try_speed,
    _try_profit,
    _try_probability,
    _try_set,
]


def solve(text: str, choices: List[str]) -> str:
    """
    Attempt each pattern matcher in order.
    Return the best matching choice, or closest_choice as fallback.
    """
    nums = _extract_numbers(text)
    for fn in _PATTERN_FUNCS:
        result = fn(text, nums)
        if result is not None:
            exact = _is_match(result, choices)
            if exact:
                return exact
            return closest_choice(result, choices)

    # Generic: try simple arithmetic of all extracted numbers
    if len(nums) >= 2:
        # Last resort: product / sum heuristics
        for candidate in [sum(nums), nums[0] * nums[1], nums[0] - nums[1]]:
            exact = _is_match(candidate, choices)
            if exact:
                return exact

    return choices[0] if choices else ""


if __name__ == "__main__":
    import doctest
    doctest.testmod(verbose=True)
