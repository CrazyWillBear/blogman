import os
from pathlib import Path
from typing import Optional

from bs4 import BeautifulSoup
from blogman.BlogBuilder import BlogBuilder
from blogman.HomepageBuilder import HomepageBuilder
from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer


class FileManager(FileSystemEventHandler):
    """A class that manages all html, css, and markdown directories and files."""

    def __init__(self, md_dir: Path, html_dir: Path, home_html_path: Path,
                 home_md_path: Path):
        """Initialize a FileManager object"""
        self.md_dir = md_dir
        self.html_dir = html_dir
        self.home_html_path = home_html_path
        self.page_list = self._get_page_list()

        self.blog_builder = BlogBuilder(self.html_dir)
        self.homepage_builder = HomepageBuilder(self.page_list, self.home_html_path, self.blog_builder)
        self.md_observer = Observer()
        self.html_observer= Observer()

    def _get_page_list(self):
        page_list = []

        for file in self.html_dir.iterdir():
            file_dict = {
                "path": file,
                "name": file.stem
            }

            page_list.append(file_dict)

        return page_list

    def start(self) -> None:
        """Starts the file manager"""
        self.md_observer.schedule(self, path=str(self.md_dir), recursive=False)
        self.md_observer.start()
    def stop(self) -> None:
        """Stops the file manager"""
        self.md_observer.stop()
        self.md_observer.join()

    def _get_html_file(self, md_file: Path) -> Optional[Path]:
        """Gets the path to a Markdown file's corresponding HTML file. Returns None if it can't be found"""
        html_file = self.html_dir / (md_file.stem.replace(" ", "-") + ".html")

        if html_file.exists():
            return html_file
        return None

    def on_created(self, event: FileSystemEvent) -> None:
        """Event handling logic for file creation"""
        path = Path(event.src_path)

        print("Create;", path)

        if not path.exists() or path.suffix != ".md":
            return

        print("; Passed")

        self.blog_builder.build_blog(path)
        self.homepage_builder.build()

    def on_modified(self, event: FileSystemEvent) -> None:
        """Event handling logic for file modification"""
        path = Path(event.src_path)

        print("Modify;", path)

        if not path.exists() or path.suffix != ".md":
            return

        print("; Passed")

        self.blog_builder.build_blog(path)
        self.homepage_builder.build()

    def on_deleted(self, event) -> None:
        """Event handling logic for file deletion"""
        path = Path(event.src_path)

        print("Delete;", path.suffix)

        if path.suffix != ".md":
            return

        print("; Passed")

        html_file = self._get_html_file(path)

        if html_file is not None:
            os.remove(html_file)
            self.homepage_builder.build()
        else:
            raise FileNotFoundError(
                "Attempted to delete non-existent html file")
