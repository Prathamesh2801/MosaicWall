import DomeGallery from "./UI/DomeGallery";

export default function DomeUI() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <DomeGallery
        autoRotate={true}
        autoRandomImgOpen={true}
        autoRotateSpeedDegPerSec={10}
        autoVerticalBobbingAmplitudeDeg={1.2}
        autoVerticalBobbingPeriodSecRange={[6, 12]}
        autoRandomOpenIntervalSecRange={[3, 10]}
         autoRandomOpenPreviewSec={2}
      />
    </div>
  );
}
