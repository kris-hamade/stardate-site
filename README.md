# Stardate Calculator

A beautiful web app for converting Earth dates to Star Trek-style stardates, supporting multiple epochs.

## Features
- Modern, responsive design
- Select any date using a date picker
- Choose between Space Age Epoch (1957) and Star Trek Epoch (2323)
- Instantly calculates and displays the stardate
- Prominently displays today's date and stardates for both epochs

## Usage
1. **Clone or download this repository.**
2. Open `public/index.html` in your browser, or serve the `public/` directory with a static file server.
3. Select a date and epoch, then click "Calculate Stardate" to see the result.

## Deployment
You can deploy this site to any static hosting provider (e.g., GitHub Pages, Netlify, Vercel, Cloudflare Pages).

### Example: Local Development
To run locally with a simple static server:

```sh
npx serve public
```

Or use Python:
```sh
cd public
python -m http.server 8080
```
Then visit [http://localhost:8080](http://localhost:8080).

## Customization
- You can adjust the styling and logic in `public/index.html` and `public/script.js` as desired.
- The stardate calculation logic is in `public/script.js` and can be modified for other epochs or formulas.

## License
MIT
