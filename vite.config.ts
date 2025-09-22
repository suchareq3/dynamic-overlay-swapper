import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import Unfonts from "unplugin-fonts/vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(),
    Unfonts({
      custom: {
        families: [
          {
            name: "LCDDot",
            local: "LCDDot",
            src: "./public/fonts/LCDDot.ttf",
          },
          {
            name: "Eurostile",
            local: "Eurostile",
            src: "./public/fonts/Eurostile.ttf",
          },
          {
            name: "VT323",
            local: "VT323",
            src: "./public/fonts/VT323.ttf",
          },
          {
            name: "Questrial",
            local: "Questrial",
            src: "./public/fonts/Questrial.ttf",
          }
        ],
        display: "auto",
        preload: true,
        injectTo: "head-prepend",
      },
    }),
  ],
  server: {
    watch: {
      ignored: ["**/pb_data/**"]
    }
  },
  ssr: {
    noExternal: ["primereact"]
  },
  build: {
    target: "esnext"
  }
});