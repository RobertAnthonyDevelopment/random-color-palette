from flask import Flask, render_template, jsonify, request

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/generate_lorem", methods=["POST"])
def generate_lorem():
    data = request.get_json()
    if not data or "paragraphs" not in data:
        return jsonify({"error": "Invalid request"}), 400

    paragraphs = int(data["paragraphs"])
    if paragraphs < 1 or paragraphs > 10:
        return jsonify({"error": "Paragraph count must be between 1 and 10"}), 400

    lorem = (
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. "
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. "
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    )

    text = "\n\n".join([lorem for _ in range(paragraphs)])
    return jsonify({"lorem_text": text})

if __name__ == "__main__":
    app.run(debug=True)
