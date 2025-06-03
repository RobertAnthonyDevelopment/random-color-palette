from flask import Flask, render_template, jsonify, request
from datetime import datetime
import random

app = Flask(__name__, static_folder='static', template_folder='templates')

LOREM_IPSUM_SENTENCES = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
    "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
    "Consectetur, adipisci velit, sed quia non numquam eius modi tempora.",
    "Ut labore et dolore magnam aliquam quaerat voluptatem.",
    "Quis autem vel eum iure reprehenderit qui in ea voluptate velit.",
]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/generate_lorem", methods=["POST"])
def generate_lorem():
    try:
        data = request.get_json()

        if not data or "paragraphs" not in data:
            return jsonify({
                "error": "Invalid request",
                "message": "Paragraph count is required"
            }), 400

        paragraphs = int(data["paragraphs"])
        if paragraphs < 1 or paragraphs > 10:
            return jsonify({
                "error": "Invalid input",
                "message": "Paragraph count must be between 1 and 10"
            }), 400

        generated_text = []
        for _ in range(paragraphs):
            sentence_count = random.randint(3, 6)
            paragraph = " ".join(random.sample(LOREM_IPSUM_SENTENCES, sentence_count))
            generated_text.append(paragraph)

        return jsonify({
            "lorem_text": "\n\n".join(generated_text),
            "generated_at": datetime.utcnow().isoformat(),
            "paragraphs": paragraphs
        })

    except ValueError as e:
        return jsonify({
            "error": "Invalid input",
            "message": str(e)
        }), 400
    except Exception as e:
        app.logger.error(f"Error generating Lorem Ipsum: {str(e)}")
        return jsonify({
            "error": "Server error",
            "message": "Failed to generate text"
        }), 500

if __name__ == "__main__":
    app.run(debug=True)
