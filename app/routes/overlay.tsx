import type { Route } from "./+types/home";
import { Overlay as OverlayComponent } from "../overlay/overlay";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dynamic overlay" },
    { name: "description", content: "Welcome to your dynamic overlay!" },
  ];
}

export default function Overlay() {
  return <OverlayComponent />;
}
