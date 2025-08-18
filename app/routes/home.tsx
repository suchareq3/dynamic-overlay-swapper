import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { ConfigPanel } from "~/config-panel/configPanel";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dynamic Overlay Swapper" },
    { name: "description", content: "Dynamic Overlay Swapper" },
  ];
}

export default function Home() {
  return <ConfigPanel />;
}
