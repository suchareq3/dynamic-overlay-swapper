# Dynamic Overlay Swapper

A web app built with React and PocketBase for dynamically swapping overlays for streaming software such as OBS.

## Features

- Upload .png or .gif images to use as overlays
- ...or create your own custom React components to use as overlays
- Provide one URL to use as an overlay in OBS (or other software), and hot-swap between your active overlays dynamically

## How to use

1. Clone this repository
2. Open a terminal in the root directory of the repository
3. Run `./pocketbase serve` to start the PocketBase server
4. Open `http://localhost:8090` in your browser to access the config panel
5. Upload an image or create a custom React component to use as an overlay
6. Set the active overlay in the config panel
7. Use the overlay by providing the overlay URL in OBS ('http://127.0.0.1:8090/overlay' by default)

## Development

1. Install dependencies: `npm install`
2. Start the PocketBase server: `./pocketbase serve`
3. Start the development server with HMR: `npm run dev` then open the config panel in your browser (default: `http://localhost:5173`)
4. Once done with development, build the production app: `npm run build`
5. Copy the contents of the `\build\client` directory to `\pb_public`

If necessary, you can log into the PocketBase admin panel at `http://localhost:8090` using these admin credentials:
    Admin email: `adminadmin@gmail.com`
    Admin password: `adminadmin`

### Frameworks & libraries used

- Backend: PocketBase (local)
- Frontend: React, Vite, React Router, PrimeReact, TailwindCSS