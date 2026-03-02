import { createBrowserRouter } from "react-router-dom";
import BrandOnboarding from "./Onboard/Brand";
import CampaignOnboarding from "./Onboard/Campaign";
import SpotifyClone from "../Clones/Spotify/SPPage";
import YoutubeClone from "../Clones/Youtube/YTPage";
import HomePage from "./HomePage";
import RootLayout from "./RootLayout";
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage />, handle: { title: "ChameleonAds" } },
      {
        path: "onboard",
        element: <BrandOnboarding />,
        handle: { title: "Create brand" },
      },
      {
        path: "onboard/campaign",
        element: <CampaignOnboarding />,
        handle: { title: "Create Campaign" },
      },
      {
        path: "/test/spotify",
        element: <SpotifyClone />,
        handle: { title: "Spotify Clone", icon: "/spotify-icon.png" },
      },

      {
        path: "/test/youtube",
        element: <YoutubeClone />,
        handle: { title: "YouTube Clone", icon: "/youtube-icon.png" },
      },
    ],
  },
]);
export default router;
