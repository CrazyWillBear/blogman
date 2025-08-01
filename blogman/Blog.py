import json
import re
from datetime import datetime
from pathlib import Path

from blogman import BLOG_DIR, MD_DIR
from blogman.BlogPageBuilder import BlogPageBuilder
from blogman.Hash import Hash


class Blog:
    """
    Represents a Blog itself.

    Holds data such as file paths associated with the Blog, its title, markdown content, HTML content, tags, and date
    data (including creation and recent modification dates). Assumes JSON files are stored in BLOG_DIR and blog markdown
    files are stored in MD_DIR (which they should be).

    Attributes:
        blog_md (Path): path to the Blog's markdown file
        md_content (str): the Blog's markdown content
        html_content (str): the Blog's HTML content
        tags (list): the Blog's self-described tags
        date_created (datetime): the date of the Blog's creation
        date_last_modified (datetime): the date of the Blog's last modification
        json_file (Path): path to the Blog's json file

    """

    # --- Constructor --- #
    def __init__(self, blog_name: str):
        """
        Constructor for Blog object.

        Args:
            blog_name (str): The Blog's Markdown file's name without suffix
        """
        self.blog_md = MD_DIR / (blog_name + ".md")  # this should be the Blog's Markdown file
        self.title = blog_name  # this can be updated now

        (self.md_content,
         self.html_content,
         self.tags,
         self.date_created,
         self.date_last_modified,
         self.pinned) = None, None, [], None, None, None  # initialize these

        # get the Blog's json path
        self.json_file = self._get_json_file_path()

        if self.json_file.exists():
            # load the json
            self._load_json()

            # check to see if Markdown needs to be reapplied
            raw_md = self.read_md()
            if not self._compare_md_hashes(raw_md):
                self.apply_md(raw_md)  # this updates tags, md_content, and html_content

        else:  # if the file doesn't exist set values to default
            cur_date = datetime.now()
            self.date_created, self.date_last_modified = cur_date, cur_date
            self.pinned = False  # false by default

        self._save_json()  # write the json

    # --- Static Method(s) --- #
    @staticmethod
    def _get_tags(line: str) -> list:
        """
        From a string, detects if tags are present in the form '{x}{y}{z}...' and returns them.

        Args:
            line (str): the line you want to extract tags from

        Returns:
            list: A list of tags or an empty list if none found
        """
        if len(line) == 0:  # empty string
            return []  # return an empty list

        tag_pattern = r'^(\{.*?\})+$'  # this is the pattern we want to detect
        if bool(re.match(tag_pattern, line)):
            # split into individual tags
            tags = line \
                .replace("{", "") \
                .split("}")
            return tags[:-1]  # there's always an empty string or a break-line at the very end, so remove it

        return []  # if it didn't match, then there are no tags so return an empty list

    @staticmethod
    def _remove_tags(md: str) -> str:
        """
        From a string, detect is tags are present and if so return a string with them removed.

        Args:
            md (str): the Markdown content to remove tags from

        Returns:
            str: The Markdown content with the tags removed
        """
        md_split = md.split("\n")
        if not Blog._get_tags(md_split[0]):
            return md
        else:
            return "\n".join(md_split[1:])

    # --- Public Methods --- #
    def get_formatted_tags(self) -> str:
        """
        Formats the tags as a string.

        Returns:
            str: The tags formatted nicely
        """
        tags_str = ""

        for tag in self.tags:
            if tag != "pinned":
                tags_str += f"({tag}),"

        return tags_str[:-1]

    def read_md(self) -> str:
        """
        Reads and returns the Blog's raw Markdown file.

        Returns:
            str: The Blog's Raw Markdown.
        """
        with open(self.blog_md, "r", encoding="utf-8") as file:
            raw_md = file.read()
        return raw_md

    def tags_empty(self) -> bool:
        """
        Checks if Blog's tags are empty.

        Returns:
            bool: True if the tags are empty, False otherwise
        """
        return len(self.tags) == 0

    def update_date_last_modified(self) -> None:
        """
        Replaces the Blog's date last modified with the current date and time.
        """
        self.date_last_modified = datetime.now()
        self._save_json()

    def apply_md(self, raw_md) -> None:
        """
        Reads and applies the Markdown file to the Blog. Updates the markdown content, tags, and pin status.
        """
        md_lines = raw_md.split("\n")  # this starts out at a list

        # if markdown content is empty the file was created blank; do nothing
        if not raw_md.strip():
            return

        top_line = md_lines[0]  # the tags can only be on the top line

        self.tags = self._get_tags(top_line)

        # apply pinned tag
        if "pinned" in self.tags:
            self.pinned = True
        else:
            self.pinned = False

        # now we join the markdown content into one string
        if len(self.tags) > 0 or self.pinned:
            lines = md_lines[1:]
            self.md_content = "\n".join(lines)
        else:
            self.md_content = "\n".join(md_lines)

        self.html_content = BlogPageBuilder.build_blog_page(self.md_content, self.title)

        self._save_json()

    # --- Internal Methods --- #
    def _compare_md_hashes(self, raw_md) -> bool:
        """
        Compares the cached Markdown hash to what's currently stored in Markdown directory.

        Returns:
            bool: True if hashes match, false otherwise.
        """
        if self.md_content is None or raw_md is None:
            return False

        return Hash.hash(self.md_content) == Hash.hash(Blog._remove_tags(raw_md))

    def _get_json_file_path(self) -> Path:
        """
        Gets the json file path for the Blog.

        Returns:
            Path: The path to the Blog's json file.
        """
        return BLOG_DIR / (self.blog_md.stem + ".json")

    def _load_json(self) -> None:
        """
        Reads a blog's JSON file and sets class variables to match. Doesn't set title as this is set when constructed.
        """
        with open(self.json_file, "r", encoding="utf-8") as f:
            json_file_str = f.read()

        json_dict = json.loads(json_file_str)

        self.md_content = json_dict["md_content"]
        self.html_content = json_dict["html_content"]
        self.tags = json_dict["tags"]
        self.pinned = json_dict["pinned"]
        self.date_created = datetime.fromisoformat(json_dict["date_created"])
        self.date_last_modified = datetime.fromisoformat(json_dict["date_last_modified"])

    def _save_json(self) -> None:
        """
        Saves and writes the Blog's json.
        """
        json_dict = {
            "title": self.title,
            "md_content": self.md_content,
            "html_content": self.html_content,
            "tags": self.tags,
            "pinned": self.pinned,
            "date_created": self.date_created.isoformat(),
            "date_last_modified": self.date_last_modified.isoformat()
        }

        json_file = BLOG_DIR / (self.title + ".json")
        with open(json_file, "w", encoding="utf-8") as f:
            f.write(json.dumps(json_dict, indent=2))
