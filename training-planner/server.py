"""Serve the bundled planner locally using only the Python standard library."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

PUBLIC = Path(__file__).resolve().parent / 'public'
CSP = "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; worker-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.js':'text/javascript', '.json':'application/json', '.wasm':'application/wasm', '.svg':'image/svg+xml'}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def send_head(self):
        route = unquote(urlsplit(self.path).path)
        target = (PUBLIC / route.lstrip('/')).resolve()
        if PUBLIC.resolve() not in target.parents and target != PUBLIC.resolve():
            self.send_error(404); return None
        if target.is_dir() and not (target/'index.html').is_file():
            self.send_error(404); return None
        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control','no-cache')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Content-Security-Policy',CSP)
        super().end_headers()


if __name__=='__main__':
    try:
        with ThreadingHTTPServer(('127.0.0.1',4173),Handler) as server:
            print('Training planner: http://127.0.0.1:4173',flush=True)
            print('Keep this terminal open. Press Ctrl+C to stop.',flush=True)
            server.serve_forever()
    except KeyboardInterrupt:
        pass
    except OSError as e:
        raise SystemExit(f'Cannot start: {e}. If the app is already running, open http://127.0.0.1:4173.')
