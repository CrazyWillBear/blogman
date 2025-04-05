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

    blog_list = []  # static across all instances of FileManager

    # --- Constructor --- #
    def __init__(self, md_dir: Path):
        """
        Constructor for FileManager object.

        Args:
            md_dir (Path): the path to the Markdown directory
        """
        self.md_dir = md_dir
        self.md_observer = Observer()

        FileManager.update_blog_list()  # update the blog_list
        FileManager._clean_blog_dir()  # clean the blog directory

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
            if query:
                if not FileManager._matches_query(blog, query):
                    continue

            blog_list.append(blog)


        # sort the list by specified criteria
        FileManager.blog_list = FileManager._sort_blog_list(blog_list, sort_by)

    # --- Static Internal Method(s) --- #
    @staticmethod
    def _clean_blog_dir() -> None:
        for file in BLOG_DIR.iterdir():
            md_path = MD_DIR / (file.stem + ".md")

            if not md_path.exists():
                FileManager._delete_json(md_path)

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
    def _matches_query(blog: Blog, query: str) -> bool:
        """
        Matches a query to a blog.

        Args:
            blog (Blog): the blog object
            query (str): the query to match with
        """
        query_lower = query.lower()
        tags_str = ''.join(blog.tags).lower()

        print(query_lower, tags_str)
        print(query_lower in tags_str)

        return (
                query_lower in blog.md_content.lower() or
                query_lower in blog.title.lower() or
                query_lower in tags_str
        )

    @staticmethod
    def _sort_blog_list(blog_list: list, sort_by: str) -> list:
        """
        Sorts a given blog list by the specified criteria
        """
        if len(blog_list) <= 1:
            return blog_list
        elif sort_by == "date_created_asc":
            return sorted(blog_list, key=lambda blog: blog.date_created)
        elif sort_by == "date_modified_desc":
            return sorted(blog_list, key=lambda blog: blog.date_last_modified, reverse=True)
        elif sort_by == "date_modified_asc":
            return sorted(blog_list, key=lambda blog: blog.date_last_modified)
        else: # sort must be date_created_desc, which is what we want as default anyway
            return sorted(blog_list, key=lambda blog: blog.date_created, reverse=True)

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
