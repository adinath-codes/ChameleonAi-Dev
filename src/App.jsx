import { useEffect } from "react";
import router from "./Pages/router";
import { RouterProvider, useMatch } from "react-router-dom";
function App() {
  return <RouterProvider router={router} />;
}

export default App;
