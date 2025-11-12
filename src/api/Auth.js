import axios from "axios";
import { BASE_URL } from "../../BASE_URL";

export async function loginSA(username, password) {
  try {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await axios.post(`${BASE_URL}/log.php`, formData, {
      validateStatus: (status) => true,
    });

    if (response.data.Status) {
      console.log("Login successful");
      console.log("Message:", response.data.Message);
      console.log("Token:", response.data.Token);
      localStorage.setItem("Token", response.data.Token);
      localStorage.setItem("Role", response.data.Role);
    } else {
      console.error("Login failed:", response.data.Message);
    }

    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
}
