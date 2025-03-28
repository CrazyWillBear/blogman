from pathlib import Path

# Software author + version (don't change)
AUTHOR = "William B. Chastain"
GH = "https://github.com/CrazyWillBear/blogman"
VERSION = "0.0.1"

# This is the current working directory. For the purposes
# of my specific configuration, this works best. No need
# to keep this if it doesn't work for you.
BASE_DIR = Path.cwd()

# Directory congiruation
HTML_DIR = BASE_DIR / "html"
MD_DIR = BASE_DIR / "md"
HTML_TEMPLATE_DIR = BASE_DIR / "html_templates"
CSS_DIR = BASE_DIR / "css"

# File configuration (recommend leaving as default, just make
# sure the template, style, and markdown files exist)
HOME_HTML_PATH = HTML_DIR / "home.html"  # this doesn't have to already exist
HOME_MD_PATH = MD_DIR / "home.md"
STYLE_SHEET_PATH = CSS_DIR / "style.css"

BLOG_TEMPLATE_PATH = HTML_TEMPLATE_DIR / "blog-template.html"
HOME_TEMPLATE_PATH = HTML_TEMPLATE_DIR / "home-template.html"