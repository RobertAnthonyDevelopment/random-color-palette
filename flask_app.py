from flask import Flask, jsonify, render_template
import random

app = Flask(__name__, static_folder="static", template_folder="templates")

# Function to generate random hex colors
def generate_random_color():
    return "#{:06x}".format(random.randint(0, 0xFFFFFF))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_palette', methods=['GET'])
def generate_palette():
    colors = [generate_random_color() for _ in range(5)]
    return jsonify(colors)

if __name__ == '__main__':
    app.run(debug=True)
