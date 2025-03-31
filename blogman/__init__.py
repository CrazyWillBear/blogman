from pathlib import Path

from dominate.tags import header, h1, p

# Software author + version (don't change)
AUTHOR = "William B. Chastain"
GH = "https://github.com/CrazyWillBear/blogman"
VERSION = "0.0.2-alpha"

# Your blog page's name + description (this will appear on
# your main page underneath the name)
BLOG_NAME = "My Blog"
BLOG_DESCRIPTION = """\
This is my blog's description. It should be a solid paragraph, perhaps about the origin of your blog.

You can make it multiple paragraphs, with spacing between them like this!
"""

# This is the current working directory. For the purposes
# of my specific configuration, this works best. No need
# to keep this if it doesn't work for you.
BASE_DIR = Path.cwd()

# Directory configuration
HTML_DIR = BASE_DIR / "html"
MD_DIR = BASE_DIR / "md"
CSS_DIR = BASE_DIR / "css"

# File configuration (recommend leaving as default, just make
# sure the template, style, and markdown files exist)
HOME_HTML_PATH = HTML_DIR / "home.html"  # this doesn't have to already exist
HOME_MD_PATH = MD_DIR / "home.md"
STYLE_SHEET_PATH = CSS_DIR / "style.css"
