import { createHashRouter, RouterProvider } from "react-router-dom";
import ImageDeformPreview from "../components/RND/dimension/ImageDeformPreview";
import DeformToMosaicAPIDimension from "../components/RND/dimension/DeformToMosaicAPIDimension";
import ImageGlobe from "../components/UI/ImageGlobe";
import ScrollyImages from "../components/UI/ScrollyImages";
import { ConfigPanel } from "../components/UI/ScrollConfig.jsx";
import DomeUI from "@/components/DomeUI";

export default function MainRoute() {

  const router = createHashRouter([
    { path: "/", element: <DeformToMosaicAPIDimension /> },
    { path: "/preview", element: <ImageDeformPreview /> },
    { path: "/scrollup", element: <ScrollyImages/>},
    { path: "/scrollup1", element: <ConfigPanel/>},
    { path: "/dome", element: <DomeUI/>},
    {
      path: "/globe",
      element: <ImageGlobe limit={40} imageCount={40} />,
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
