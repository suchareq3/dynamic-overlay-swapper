import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("overlay", "routes/overlay.tsx"),
] satisfies RouteConfig;
