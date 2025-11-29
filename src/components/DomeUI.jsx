import DomeGallery from "./UI/DomeGallery";

export default function DomeUI() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <DomeGallery
        autoRotate={true}
        autoRandomImgOpen={true}
        autoRotateSpeedDegPerSec={15}
        autoVerticalBobbingAmplitudeDeg={3.2}
        autoVerticalBobbingPeriodSecRange={[8, 10]}
        autoRandomOpenIntervalSecRange={[5, 7]}
        autoRandomOpenPreviewSec={3}
      />
    </div>
  );
}
