import axios from "axios";
import { BASE_URL } from "../../BASE_URL";

export async function uploadImageMosaic(file) {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const resp = await axios.post(`${BASE_URL}/handleupload.php`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      validateStatus: (status) => true,
    });
    console.log("test", `${BASE_URL}/${resp.data.file_result.file_path}`);

    return resp.data;
  } catch (err) {
    console.error("uploadImageMosaic error:", err);
    throw err;
  }
}
