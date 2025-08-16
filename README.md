# Dynamic Overlay Swapper

A web app built with React and PocketBase for dynamically swapping overlays for streaming software such as OBS.

<img width="1919" height="895" alt="image" src="https://github.com/user-attachments/assets/3a429770-cea2-4844-8326-b8f5592c7a6a" />


## Features

- Hosts a local webapp with your overlay of choice, whose URL you can provide to OBS
- Upload your PNG/GIF images or create custom React components to use as overlays
- All overlays are stored in a local, persistent database
- Once uploaded, you can dynamically switch between your overlays in your config panel. The overlay will update _in real time_ - no need to change the source in OBS!

## How to use

1. Clone this repository
2. Open a terminal in the root directory of the repository
3. Run `./pocketbase serve` to start the PocketBase server
4. Open `http://localhost:8090` in your browser to access the config panel
5. Upload an image or create a custom React component to use as an overlay
6. Set the active overlay in the config panel
7. Use the overlay by providing the overlay URL in OBS (`http://127.0.0.1:8090/overlay` by default)

## Development

1. Install dependencies: `npm install`
2. Start the PocketBase server: `./pocketbase serve`
3. Start the development server with HMR: `npm run dev` then open the config panel in your browser (default: `http://localhost:5173`)
4. Once done with development, build the production app: `npm run build`
5. Copy the contents of the `\build\client` directory to `\pb_public`

If necessary, you can log into the PocketBase admin panel at `http://localhost:8090` using these admin credentials:
- Admin email: `adminadmin@gmail.com`
- Admin password: `adminadmin`

### Limitations

- Overlays must be uploaded to the database before you can use them
- Only .png and .gif images are supported
- 1920x1080 images work best - there's no way to position images (unless you create a React Component overlay)
- Only 1 overlay can be active at a time

### Frameworks & libraries used

- Backend: PocketBase (local)
- Frontend: React, Vite, React Router, PrimeReact, TailwindCSS
