import DeformToMosaicAPIDimension from "./components/RND/dimension/DeformToMosaicAPIDimension";
import { createHashRouter, RouterProvider } from "react-router-dom";
import ImageDeformPreview from "./components/RND/dimension/ImageDeformPreview";
import ImageGlobe from "./components/UI/ImageGlobe";


export default function App() {
  const router = createHashRouter([
    { path: "/", element: <DeformToMosaicAPIDimension /> },
    { path: "/preview", element: <ImageDeformPreview /> },
    {
      path: "/globe",
      element: <ImageGlobe limit={100} imageCount={100}  />,
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
