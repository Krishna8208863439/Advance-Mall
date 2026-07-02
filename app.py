import os
from flask import Flask, send_from_directory

app = Flask(__name__, static_folder='dist')

# Serve static files and fallback to index.html for React SPA
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # For local running if needed
    app.run(port=int(os.environ.get("PORT", 8080)), debug=True)
