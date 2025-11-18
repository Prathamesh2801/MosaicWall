import DeformToMosaicAPIDimension from "./components/RND/dimension/DeformToMosaicAPIDimension";
import { createHashRouter, RouterProvider } from "react-router-dom";
import ImageDeformPreview from "./components/RND/dimension/ImageDeformPreview";
import ImageGlobe from "./components/UI/ImageGlobe";
import d1 from "../src/assets/img/demobg.jpg";
import d2 from "../src/assets/img/demobg3.jpg";
import d3 from "../src/assets/img/dummyBg.png";

export default function App() {
  const router = createHashRouter([
    { path: "/", element: <DeformToMosaicAPIDimension /> },
    { path: "/preview", element: <ImageDeformPreview /> },
    {
      path: "/globe",
      element: <ImageGlobe images={[d1, d2, d3,d1, d2, d3,d1, d2, d3,d1, d2, d3,d1, d2, d3,d1, d2, d3,d1, d2, d3,d1, d2, d3,d1, d2, d3,d1, d2, d3,d1, d2, d3]} imageCount={40} />,
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
