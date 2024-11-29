from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Initial default color palette
default_colors = ["#638b7f", "#033033", "#a31894", "#e40885", "#0954d6"]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/get_palette", methods=["GET"])
def get_palette():
    # Returns the current color palette
    return jsonify(default_colors)

@app.route("/api/save_palette", methods=["POST"])
def save_palette():
    data = request.get_json()
    if not data or "colors" not in data:
        return jsonify({"error": "Invalid request"}), 400
    # Update the palette
    global default_colors
    default_colors = data["colors"]
    return jsonify({"message": "Palette updated successfully"})

if __name__ == "__main__":
    app.run(debug=True)
