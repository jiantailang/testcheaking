# Test type identifiers
TEST_TYPE_SPI = "SPI"
TEST_TYPE_TG_WEB = "TG-WEB"
TEST_TYPE_TAMATEBAKO = "tamatebako"

# Active test type
TEST_TYPE = TEST_TYPE_SPI

# Browser settings
HEADLESS = False
BROWSER_TIMEOUT = 30000  # ms

# Human-like wait range (seconds)
WAIT_MIN = 1.0
WAIT_MAX = 3.0

# Retry settings
MAX_RETRIES = 3
RETRY_DELAY = 2.0

# Screenshot save directory
SCREENSHOT_DIR = "screenshots"

# Numeric answer tolerance
ANSWER_TOLERANCE = 0.01
