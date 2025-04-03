import json
from datetime import datetime
from pathlib import Path

from blogman import BLOG_DIR, MD_DIR


class Blog:
    """Class representing a Blog. Stores variables such as title, content, date created, and date last modified."""
    def __init__(self, blog_name: str):
        """Constructor for Blog object."""
        self.blog_md = MD_DIR / (blog_name + ".md")

        # check if blog's json already exists
        self.json_file = self.get_json_file_path()

        if self.json_file.exists():
            # if so, just load from that file
            self._load_from_json(self.json_file)

        # otherwise start fresh
        else:
            self.title = blog_name

            with open(self.blog_md, "r", encoding="utf-8") as f:
                self.md_content = f.read()

            self.date_created = datetime.now()
            self.date_last_modified = datetime.now()

        self.save_json()

    def get_json_file_path(self):
        return BLOG_DIR / (self.blog_md.stem + ".json")

    def _load_from_json(self, json_file: Path) -> None:
        """Reads a blog's JSON file and applies it to the Blog object"""
        with open(json_file, "r", encoding="utf-8") as f:
            json_file_str = f.read()

        json_dict = json.loads(json_file_str)

        self.title = json_dict["title"]
        self.md_content = json_dict["md_content"]
        self.date_created = datetime.fromisoformat(json_dict["date_created"])
        self.date_last_modified = datetime.fromisoformat(json_dict["date_last_modified"])

    def save_json(self) -> None:
        json_dict = {
            "title": self.title,
            "md_content": self.md_content,
            "date_created": self.date_created.isoformat(),
            "date_last_modified": self.date_last_modified.isoformat()
        }

        json_file = BLOG_DIR / (self.title + ".json")
        with open(json_file, "w", encoding="utf-8") as f:
            f.write(json.dumps(json_dict))

    def update_date_last_modified(self):
        self.date_last_modified = datetime.now()
        self.save_json()

    def update_md_content(self):
        with open(self.blog_md, "r", encoding="utf-8") as f:
            self.md_content = f.read()
        self.save_json()
