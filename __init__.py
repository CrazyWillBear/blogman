from pathlib import Path

# Software version (don't change)
VERSION = "0.0.1"

# This is the project root. If you plan on having your
# directories and files outside of the project root,
# you can safely delete this or ignore it.
BASE_DIR = Path(__file__).resolve().parent

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