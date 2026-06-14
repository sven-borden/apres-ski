import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Apres-Ski",
    short_name: "Apres-Ski",
    description:
      "Shared ski-trip organizer for one chalet crew: countdown, attendance, meals, shopping and chalet info.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#11161f",
    theme_color: "#11161f",
    lang: "fr",
    categories: ["travel", "lifestyle", "productivity"],
    icons: [
      { src: "/logo.png", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/logo.png", sizes: "256x256", type: "image/png", purpose: "maskable" },
    ],
  };
}
