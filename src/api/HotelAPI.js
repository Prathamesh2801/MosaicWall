// src/api/CategoryAPI.js
import axios from "axios";
import { BASE_URL } from "../../BASE_URL";

const HOTEL_URL = BASE_URL + "/superAdmin/hotel.php";

function getAuthHeaders() {
  const token = localStorage.getItem("Token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getHotelDetails(filters = {}) {
  try {
    const response = await axios.get(HOTEL_URL, {
      headers: getAuthHeaders(),
      params: {
        Hotel_ID: filters.Hotel_ID,
        Hote_Name: filters.Hotel_Name,
        Hotel_Contact: filters.Hotel_Contact,
        Hotel_Location: filters.Hotel_Location,
      },
      validateStatus: (status) => true,
    });

    console.log("Fetch Hotel Details ", response.data);
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching Hotel Details :", error);

    throw error;
  }
}

export async function createHotelDetails(hotelData) {
  try {
    const formData = new FormData();
    formData.append("Hotel_Name", hotelData.Hotel_Name);
    formData.append("Hotel_Contact", hotelData.Hotel_Contact);
    formData.append("Hotel_Location", hotelData.Hotel_Location);

    const response = await axios.post(HOTEL_URL, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
      validateStatus: (status) => true,
    });
    console.log("Create Hotel details :", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating Hotel Details :", error);
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    throw error;
  }
}

export async function updateHotelDetails(hotelUpdatedData) {
  try {
    const payload = {
      Hotel_ID: hotelUpdatedData.Hotel_ID,
      Hotel_Name: hotelUpdatedData.Hotel_Name,
      Hotel_Contact: hotelUpdatedData.Hotel_Contact,
      Hotel_Location: hotelUpdatedData.Hotel_Location,
    };

    const response = await axios.put(HOTEL_URL, payload, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      validateStatus: (status) => true,
    });

    console.log("Update Hotel Details ", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating Hotel Details :", error);
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    throw error;
  }
}

/**
 * DELETE Category
 * @param {string} categoryId
 */
export async function deleteHotelDetails(hotelID) {
  try {
    const params = { Hotel_ID: hotelID };

    const response = await axios.delete(HOTEL_URL, {
      headers: getAuthHeaders(),
      params,
    });

    console.log("Deleting Hotel Details ", response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting Hotel Details :", error);
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/#/login";
    }
    throw error;
  }
}
