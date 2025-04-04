import os
from pathlib import Path

from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

from blogman import BLOG_DIR, MD_DIR
from blogman.Blog import Blog


class FileManager(FileSystemEventHandler):
    """
    Manages all Markdown and JSON files.

    Uses the Observer and Blog classes to manage their associated files. Namely, the Markdown and JSON files for the
    blogs. It monitors the Markdown directory for changes and updates Blog files accordingly. It also, when initialized,
    cleans the blog directory (in case a Markdown file was deleted while blogman wasn't running) and updates all blogs.

    Attributes:
        md_dir (Path): the Markdown directory to monitor
        md_observer (Observer): the Observer object for the Markdown directory
    """

    blog_list = []  # consistent across all instances of FileManager

    # --- Constructor --- #
    def __init__(self, md_dir: Path):
        """
        Constructor for FileManager object.

        Args:
            md_dir (Path): the path to the Markdown directory
        """
        self.md_dir = md_dir
        self.md_observer = Observer()

        # need to initialize it first
        self.blog_list = None
        # then update it
        FileManager.update_blog_list()

        # clean the blog directory
        FileManager._clean_blog_dir()

    # --- Static Public Method(s) --- #
    @staticmethod
    def update_blog_list(query: str = None, sort_by: str = None) -> None:
        """
        Loads all blogs from Markdown directory and then creates and sets the list of Blogs (from the blog directory).

        Args:
            query (str): search query
            sort_by (str): what to sort by, can be None
        """
        blog_list = []

        for file in MD_DIR.iterdir():
            blog = Blog(file.stem)

            # if query is not None we need to only add matches to the list
            if query is not None:
                query_lower = query.lower()
                content_lower = blog.md_content.lower()
                name_lower = blog.title.lower()

                # check if query appears in the content, name, or tags
                if (query_lower in content_lower or
                        query_lower in name_lower or
                        query_lower in ' '.join(blog.tags).lower()):
                    blog_list.append(blog)

            else:
                blog_list.append(blog)

        # sort the list by specified criteria
        if sort_by == "date_created_asc":
            FileManager.blog_list = sorted(blog_list, key=lambda blog_: blog_.date_created)
        elif sort_by == "date_created_desc":
            FileManager.blog_list = sorted(blog_list, key=lambda blog_: blog_.date_created, reverse=True)
        elif sort_by == "date_modified_asc":
            FileManager.blog_list = sorted(blog_list, key=lambda blog_: blog_.date_last_modified)
        elif sort_by == "date_modified_desc":
            FileManager.blog_list = sorted(blog_list, key=lambda blog_: blog_.date_last_modified, reverse=True)
        else:  # sort must be None or unrecognized
            FileManager.blog_list = blog_list

    # --- Static Internal Method(s) --- #
    @staticmethod
    def _delete_json(md_path: Path) -> None:
        """
        Deletes a blog's Markdown file's corresponding JSON file.

        Args:
            md_path (Path): the path to the blog's Markdown file
        """
        json_path = BLOG_DIR / (md_path.stem + ".json")

        if json_path.exists():
            os.remove(json_path)
        else:
            raise FileNotFoundError("Attempted to delete non-existent Blog json")

    @staticmethod
    def _clean_blog_dir():
        for file in BLOG_DIR.iterdir():
            md_path = MD_DIR / (file.stem + ".md")

            if not md_path.exists():
                FileManager._delete_json(md_path)

    # --- Public Methods --- #
    def start(self) -> None:
        """
        Schedules and starts the observer.
        """
        self.md_observer.schedule(self, path=str(self.md_dir), recursive=False)
        self.md_observer.start()

    def stop(self) -> None:
        """
        Stops and closes the observer.
        """
        self.md_observer.stop()
        self.md_observer.join()

    def on_created(self, event: FileSystemEvent) -> None:
        """
        Event handling logic for file creation. Checks if the file exists or is a temporary file before creating a Blog
        object given the created Markdown file.

        Args:
            event (FileSystemEvent): the event object
        """
        path = Path(event.src_path)

        # error prevention
        if not path.exists() or path.suffix.endswith("~"):
            return

        # if a Markdown file is created
        if path.suffix == ".md":
            # we want to convert it into a Blog json file
            Blog(path.stem)

    def on_modified(self, event: FileSystemEvent) -> None:
        """
        Event handling logic for file modification. Checks if the file exists or is a temporary file before updating the
        Blog object's dates.

        Args:
            event (FileSystemEvent): the event object
        """
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
        """
        Event handling logic for file deletion. Checks if the file is temporary before deleting the corresponding Blog
        JSON file.

        Args:
            event (FileSystemEvent): the event object
        """
        path = Path(event.src_path)

        # error prevention
        if path.suffix.endswith("~"):
            return

        # deal with Markdown files by deleting the corresponding Blog json file
        if path.suffix == ".md":
            FileManager._delete_json(path)
