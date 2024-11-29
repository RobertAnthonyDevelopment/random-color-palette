from flask import Flask, jsonify, render_template, request, url_for

app = Flask(__name__)

# In-memory storage for shared palettes (clears on app restart)
shared_palettes = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/save_palette", methods=["POST"])
def save_palette():
    # Saves palette data and generates a shareable link
    data = request.get_json()
    if not data or "colors" not in data:
        return jsonify({"error": "Invalid request"}), 400

    # Generate a unique ID for the palette
    palette_id = str(len(shared_palettes) + 1)
    shared_palettes[palette_id] = data["colors"]

    shareable_link = url_for("load_palette", palette_id=palette_id, _external=True)
    return jsonify({"message": "Palette saved successfully", "link": shareable_link})

@app.route("/api/load_palette/<palette_id>", methods=["GET"])
def load_palette(palette_id):
    # Loads a shared palette
    palette = shared_palettes.get(palette_id)
    if not palette:
        return jsonify({"error": "Palette not found"}), 404
    return jsonify(palette)

if __name__ == "__main__":
    app.run(debug=True)
