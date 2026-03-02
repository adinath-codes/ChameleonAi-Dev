import { useMatches, Outlet } from "react-router-dom";
import { useEffect } from "react";

export default function RootLayout() {
  const matches = useMatches();

  useEffect(() => {
    const lastMatch = matches.find((m) => m.handle?.title);
    const icon = lastMatch?.handle?.icon;
    if (icon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href = icon;
    }
    if (lastMatch) document.title = lastMatch.handle.title;
  }, [matches]);

  return <Outlet />;
}
