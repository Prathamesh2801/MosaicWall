// import Dashboard from './pages/Dashboard'
// import { HashRouter, Routes, Route } from 'react-router-dom'
// import Login from './pages/Login'
// import { Toaster } from 'react-hot-toast'

// export default function App() {
//   return (
//     <HashRouter>
//       <Toaster
//         position="top-right"
//         reverseOrder={false}
//       />
//       <Routes>
//         <Route path='/sa/dashboard' element={<Dashboard />} />
//         <Route path='*' element={<Login />} />

//       </Routes>
//     </HashRouter>
//   )
// }

import React from "react";
import MosaicWall from "./components/MosaicWall";
import DeformToMosaicAPI from "./components/RND/success_set/DeformToMosaicAPI";
import MosaicWallDimension from "./components/MosaicWallDimension";
import DeformToMosaicAPIDimension from "./components/RND/dimension/DeformToMosaicAPIDimension";

export default function App() {
  return (
    <>
      {/* <Mosaic/> */}
      {/* <MosaicWall/> */}
      {/* <MosaicWallAll/> */}
      {/* <MosaicWallDimension/> */}
      {/* <MosaicWallVortex/> */}
      {/* <MosaicReveal /> */}
      {/* <ImageDeform /> */}
      {/* <MosaicParticle /> */}
      {/* <ImageDeform /> */}
      {/* <MosaicWallDeform /> */}
      {/* <ImageDeform/> */}
      {/* <DeformToMosaic /> */}
      {/* <DeformToMosaicAPI /> */}
      {/* <MosaicWallDimension/> */}
      <DeformToMosaicAPIDimension/>
    </>
  );
}
