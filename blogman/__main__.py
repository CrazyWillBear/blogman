from blogman.FileManager import FileManager
from blogman.WebServer import WebServer
from blogman import AUTHOR, GH, VERSION, \
                    MD_DIR, HTML_DIR, \
                    HOME_HTML_PATH, HOME_MD_PATH


def print_startup_text():
    # I use a raw string instead of a formatted string and \\
    # because I think it looks nicer, so I just use a .replace()
    # at the end as opposed to a formatted string
    print(r"""
Welcome to...
 ____  _
|  _ \| |
| |_) | | ___   __ _ _ __ ___   __ _ _ __
|  _ <| |/ _ \ / _` | '_ ` _ \ / _` | '_ \
| |_) | | (_) | (_| | | | | | | (_| | | | |
|____/|_|\___/ \__, |_| |_| |_|\__,_|_| |_|
                __/ |
               |___/

GitHub: {GH}
Author: {AUTHOR}
Version: {VERSION}
-=-=-=-"""
        .replace("{GH}", GH)
        .replace("{AUTHOR}", AUTHOR)
        .replace("{VERSION}", VERSION)
    )


if __name__ == "__main__":
    print_startup_text()

    print("::Loading file manager...", end="")
    file_manager = FileManager(MD_DIR, HTML_DIR,
                               HOME_HTML_PATH, HOME_MD_PATH)
    print("\r::File manager successfully loaded")

    print("::Creating web server...", end="")
    web_server = WebServer(HTML_DIR, HOME_HTML_PATH)
    print("\r::Web server successfully created")

    print("::Starting web server + file manager:")
    file_manager.start()
    web_server.run(debug=True, use_reloader=False)

    # ^ if you set `use_reloader` as True, the program will restart
    # after launching and display the intro sequence twice. Doesn't
    # break the program and is useful during development, but when
    # deployed, I'd recommend turning it off.
