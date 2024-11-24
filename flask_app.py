from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

# Function to generate a random color palette
def generate_palette():
    palette = []
    for _ in range(5):
        color = "#{:02x}{:02x}{:02x}".format(
            random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)
        )
        palette.append(color)
    return palette

# Routes
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generate_palette")
def palette():
    colors = generate_palette()
    return jsonify(colors)

if __name__ == "__main__":
    app.run()
