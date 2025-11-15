import DeformToMosaicAPIDimension from "./components/RND/dimension/DeformToMosaicAPIDimension";
import { createHashRouter, RouterProvider } from "react-router-dom";
import ImageDeformPreview from "./components/RND/dimension/ImageDeformPreview";

export default function App() {
  const router = createHashRouter([
    { path: "/", element: <DeformToMosaicAPIDimension /> },
    { path: "/preview", element: <ImageDeformPreview /> },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
