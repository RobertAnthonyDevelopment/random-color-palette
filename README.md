# Random Color Palette Generator

A simple web application to generate random color palettes and gradients, allowing users to copy hex codes and download their color palletes for use in design or development projects.

## Features

- Generate random color palettes with five colors.
- Click on any color to copy its hex code to the clipboard.
- Simple and user-friendly interface.

## How to Run the Project

1. Clone the repository or copy the project files into your desired directory.
2. Make sure you have Python installed.
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the application:
   ```bash
   python flask_app.py
   ```
5. Open your web browser and go to `http://127.0.0.1:5000`.

## File Structure

```
.
├── flask_app.py          # Main application script
├── requirements.txt      # Dependencies for the project
├── templates/
│   └── index.html        # Frontend HTML template
├── static/
│   ├── styles.css        # CSS for styling
│   └── app.js            # JavaScript for frontend logic
```

## Live Demo

Check out the live version of the application here:  
[Random Color Palette Generator](https://randomcolorpalette-robertanthonydev.pythonanywhere.com/)

## How to Use

1. Click the **Generate Palette** button to create a new set of random colors.
2. Click on any color box to copy its hex code to the clipboard.
3. Use the copied hex codes in your designs or code.
4. Use **Randomize** buttons on individual colors to quickly create new combinations.
5. Generate **Gradients** from **Random Palettes** and download them for later use.
6. **Export**, **CSS**, **JS**, and **Tailwind** 

## License

This project is open source. Feel free to use or modify it as needed.
