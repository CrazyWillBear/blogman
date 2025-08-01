from pathlib import Path

# -=-=-=-=-=-
# This is where you configure Blogman. All types of configuration are sectioned off using comments like this one. It's
# recommended to adjust the BASE_DIR to the directory you plan to put your HTML, Markdown, and CSS directories in. This
# allows you to simply adjust the names of each directory as opposed to putting the full paths to each file/directory.
# -=-=-=-=-=-


# -=-=-=-=-=-
# Start of name and description configuration. These show up on your homepage.
# -=-=-=-=-=-
BLOG_NAME = "My Blog"
BLOG_DESCRIPTION = [  # each item in this list represents a paragraph
    "This is my blog's description. It should be a solid paragraph, perhaps about the origin of your blog.",
    "You can make it multiple paragraphs, with spacing between them like this!"
]
# -=-=-=-=-=-
# End of name and description configuration.
# -=-=-=-=-=-


# -=-=-=-=-=-
# Start of directory/file configuration.
# -=-=-=-=-=-
BASE_DIR = Path.cwd()  # the parent directory of the following:

BLOG_DIR = BASE_DIR / "blogs"
MD_DIR = BASE_DIR / "md"
CSS_DIR = BASE_DIR / "css"

STYLE_SHEET_PATH = CSS_DIR / "style.css"
FAVICON_ICO_PATH = BASE_DIR / "logo.ico"
# -=-=-=-=-=-
# End of directory/file configuration.
# -=-=-=-=-=-

# -=-=-=-=-=-
# WARNING: All further values should be left as-is. Changing these could cause issues.
# -=-=-=-=-=-

# -=-=-=-=-=-
# <head> configuration for HTML files.
# -=-=-=-=-=-
HEAD_DEFAULTS = \
    """\
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <link href="style" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>"""

# -=-=-=-=-=-
# Software Github link + version.
# -=-=-=-=-=-
GH = "https://github.com/CrazyWillBear/blogman"
VERSION = "1.1.0"
