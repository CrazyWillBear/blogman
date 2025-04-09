import json
import re
from datetime import datetime
from pathlib import Path

from blogman import BLOG_DIR, MD_DIR


class Blog:
    """
    Represents a Blog itself.

    Holds data such as file paths associated with the Blog, its title, markdown content, tags, and date data (including
    creation and recent modification dates). Assumes JSON files are stored in BLOG_DIR and blog markdown files are
    stored in MD_DIR (which they should be).

    Attributes:
        blog_md (Path): path to the Blog's markdown file
        md_content (str): the Blog's markdown content
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

        self.md_content, self.tags = None, None  # these are updated later
        self.date_created, self.date_last_modified = None, None  # these are also updated later
        self.title = blog_name  # this can be updated now
        self.pinned = False  # default is False

        # get the Blog's json path
        self.json_file = self.get_json_file_path()

        # if it already exists, load the dates from the json
        if self.json_file.exists():
            self.date_created, self.date_last_modified = self._load_dates_from_json()

        # otherwise, create new dates
        else:
            self.date_created = datetime.now()
            self.date_last_modified = datetime.now()

        self.read_apply_md()  # this updates tags and md_content

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

    # --- Public Methods --- #
    def get_formatted_tags(self) -> str:
        """
        Formats the tags as a string.

        Returns:
            str: The tags formatted nicely
        """
        tags_str = ""

        for tag in self.tags:
            tags_str += f"({tag}),"

        return tags_str[:-1]

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

    def read_apply_md(self) -> None:
        """
        Reads and applies the Markdown file to the Blog. Updates the markdown content, tags, and pin status.
        """
        with open(self.blog_md, "r", encoding="utf-8") as f:
            self.md_content = f.readlines()  # this starts out at a list

        # if markdown content is empty the file was created blank; do nothing
        if not self.md_content:
            return

        top_line = self.md_content[0]  # the tags can only be on the top line

        self.tags = self._get_tags(top_line)

        # apply pinned tag
        if "pinned" in self.tags:
            self.tags.remove("pinned")
            self.pinned = True
        else:
            self.pinned = False

        # now we join the markdown content into one string
        if len(self.tags) > 0 or self.pinned:
            lines = self.md_content[1:]
            self.md_content = "".join(lines)
        else:
            self.md_content = "".join(self.md_content)

        self._save_json()

    # --- Internal Methods --- #
    def get_json_file_path(self) -> Path:
        """
        Gets the json file path for the Blog.

        Returns:
            Path: The path to the Blog's json file.
        """
        return BLOG_DIR / (self.blog_md.stem + ".json")

    def _load_dates_from_json(self) -> (datetime, datetime):
        """
        Reads a blog's JSON file and extracts the date created and date last modified and returns them as a tuple.

        Returns:
            (datetime, datetime): The date created and the date last modified (in that order) as a tuple
        """
        with open(self.json_file, "r", encoding="utf-8") as f:
            json_file_str = f.read()

        json_dict = json.loads(json_file_str)

        return (datetime.fromisoformat(json_dict["date_created"]),
                datetime.fromisoformat(json_dict["date_last_modified"]))

    def _save_json(self) -> None:
        """
        Saves and writes the Blog's json.
        """
        json_dict = {
            "title": self.title,
            "md_content": self.md_content,
            "tags": self.tags,
            "pinned": self.pinned,
            "date_created": self.date_created.isoformat(),
            "date_last_modified": self.date_last_modified.isoformat()
        }

        json_file = BLOG_DIR / (self.title + ".json")
        with open(json_file, "w", encoding="utf-8") as f:
            f.write(json.dumps(json_dict))
