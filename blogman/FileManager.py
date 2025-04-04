import os
from pathlib import Path

from blogman import BLOG_DIR
from blogman.Blog import Blog
from blogman.BlogPageBuilder import BlogPageBuilder
from blogman.HomepageBuilder import HomepageBuilder
from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer


class FileManager(FileSystemEventHandler):
    """A class that manages all html, css, and markdown directories and files."""

    def __init__(self, md_dir: Path):
        """Initialize a FileManager object"""
        self.md_dir = md_dir

        self.blog_builder = BlogPageBuilder()
        self.homepage_builder = HomepageBuilder()
        self.md_observer = Observer()

    def start(self) -> None:
        """Starts the file manager"""
        self.md_observer.schedule(self, path=str(self.md_dir), recursive=False)
        self.md_observer.start()

    def stop(self) -> None:
        """Stops the file manager"""
        self.md_observer.stop()
        self.md_observer.join()

    def on_created(self, event: FileSystemEvent) -> None:
        """Event handling logic for file creation"""
        path = Path(event.src_path)

        # error prevention
        if not path.exists() or path.suffix.endswith("~"):
            return

        # if a Markdown file is created
        if path.suffix == ".md":
            # we want to convert it into a Blog json file
            Blog(path.stem)

    def on_modified(self, event: FileSystemEvent) -> None:
        """Event handling logic for file modification"""
        path = Path(event.src_path)

        # error prevention
        if not path.exists() or path.suffix.endswith("~"):
            return

        # if a Markdown file is created
        if path.suffix == ".md":
            # we want to update its md_content and date_last_modified
            blog = Blog(path.stem)
            blog.update_date_last_modified()
            blog.update_md_content()

    def on_deleted(self, event) -> None:
        """Event handling logic for file deletion"""
        path = Path(event.src_path)

        # error prevention
        if path.suffix.endswith("~"):
            return

        # deal with Markdown files by deleting the corresponding Blog json file
        if path.suffix == ".md":
            json_path = BLOG_DIR / (path.stem + ".json")

            if json_path.exists():
                os.remove(json_path)
            else:
                raise FileNotFoundError("Attempted to delete non-existent Blog json")
