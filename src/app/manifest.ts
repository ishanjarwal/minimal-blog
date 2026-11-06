import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.blog.name,
    short_name: "Ishan Blog",
    description: siteConfig.blog.description,
    start_url: "/",
    display: "standalone",
    background_color: "#010409",
    theme_color: "#f6f8fa",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
