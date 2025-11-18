// src/api/images.js
import axios from "axios";
import { BASE_URL } from "../../BASE_URL";

/**
 * Simple fetch: server controls any internal limit.
 * Returns an array (either resp.data.data or resp.data).
 */
export async function fetchImages(limit = 20, signal = null) {
  try {
    const resp = await axios.get(`${BASE_URL}/getallImage.php`, {
      params: { limit },
      signal,
      validateStatus: () => true,
    });

    const arr = resp?.data?.data ?? resp.data ?? [];
    return Array.isArray(arr) ? arr : Object.values(arr);
  } catch (err) {
    console.error("fetchImages error:", err);
    throw err;
  }
}
