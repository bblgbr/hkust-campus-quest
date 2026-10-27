#!/usr/bin/env python3
"""Serve the self-contained Campus Quest site on this computer only."""

import argparse
import errno
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


ROOT = Path(__file__).resolve().parent
SITE = ROOT / "dist"


def main():
    parser = argparse.ArgumentParser(description="Run Campus Quest locally")
    parser.add_argument("--port", type=int, default=8765, help="starting local port (default: 8765)")
    parser.add_argument("--no-browser", action="store_true", help="do not open a browser window")
    args = parser.parse_args()

    if not (SITE / "index.html").is_file():
        parser.error("dist/index.html is missing; run this script from the complete project folder")
    if not 1 <= args.port <= 65535:
        parser.error("port must be between 1 and 65535")

    handler = partial(SimpleHTTPRequestHandler, directory=str(SITE))
    server = None
    for port in range(args.port, min(args.port + 10, 65536)):
        try:
            server = ThreadingHTTPServer(("127.0.0.1", port), handler)
            break
        except OSError as error:
            if error.errno != errno.EADDRINUSE:
                raise
    if server is None:
        parser.error("all ten local ports are occupied; choose another with --port")

    url = f"http://127.0.0.1:{server.server_port}/"
    print(f"Campus Quest is running from {SITE}", flush=True)
    print(f"Open {url}", flush=True)
    print("Press Ctrl+C to stop the local server.", flush=True)
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nLocal server stopped.", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
