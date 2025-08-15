import type { Route } from "./+types/home";
import { Overlay as OverlayComponent } from "../overlay/overlay";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Overlay() {
  return <OverlayComponent />;
}
