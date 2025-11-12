import {
  getHotelDetails,
  createHotelDetails,
  updateHotelDetails,
  deleteHotelDetails,
} from "../api/HotelAPI";

export const hotelConfig = {
  entity: "Hotel",
  idField: "Hotel_ID",
  fields: [
    {
      name: "Hotel_ID",
      label: "Hotel ID",
      type: "text",
      required: false,
      readonly: true,
      description: "Auto-generated unique identifier",
      showInGrid: true,
      minWidth: 120,
      flex: 0.8,
    },
    {
      name: "Hotel_Name",
      label: "Hotel Name",
      type: "text",
      required: true,
      placeholder: "Enter hotel name",
      description: "The official name of the hotel",
      minWidth: 200,
      flex: 1.5,
      validate: (value) => {
        if (value && value.length < 2)
          return "Hotel name must be at least 2 characters";
        if (value && value.length > 100)
          return "Hotel name must be less than 100 characters";
        return true;
      },
    },
    {
      name: "Hotel_Contact",
      label: "Contact Number",
      type: "tel",
      required: true,
      placeholder: "Enter contact number",
      description: "Primary contact number for the hotel",
      minWidth: 180,
      flex: 1.2,
      validate: (value) => {
        if (value && !/^\+?[\d\s\-\(\)]{10,15}$/.test(value)) {
          return "Please enter a valid contact number";
        }
        return true;
      },
    },
    {
      name: "Hotel_Location",
      label: "Location",
      type: "textarea",
      required: true,
      placeholder: "Enter hotel address/location",
      description: "Full address or location details",
      rows: 3,
      fullWidth: true,
      minWidth: 250,
      flex: 2,
      validate: (value) => {
        if (value && value.length < 5)
          return "Location must be at least 5 characters";
        if (value && value.length > 500)
          return "Location must be less than 500 characters";
        return true;
      },
    },
    {
      name: "Created_At",
      label: "Created At",
      type: "text",
      required: false,
      readonly: true,
      description: "Record creation timestamp",
      showInGrid: true,
      hidden: false,
      minWidth: 180,
      flex: 1,
      valueFormatter: (params) => {
        if (params.value) {
          try {
            return new Date(params.value).toLocaleString();
          } catch (e) {
            return params.value;
          }
        }
        return "";
      },
    },
  ],
  api: {
    getAll: async (filters) => {
      try {
        console.log("Hotel API getAll called with filters:", filters);
        const result = await getHotelDetails(filters);
        console.log("Hotel API getAll result:", result);
        return result;
      } catch (error) {
        console.error("Hotel API getAll error:", error);
        throw error;
      }
    },
    create: async (data) => {
      try {
        console.log("Hotel API create called with data:", data);
        // Remove ID and Created_At fields for create
        const { Hotel_ID, Created_At, ...createData } = data;
        const result = await createHotelDetails(createData);
        console.log("Hotel API create result:", result);
        return result;
      } catch (error) {
        console.error("Hotel API create error:", error);
        throw error;
      }
    },
    update: async (data) => {
      try {
        console.log("Hotel API update called with data:", data);
        const result = await updateHotelDetails(data);
        console.log("Hotel API update result:", result);
        return result;
      } catch (error) {
        console.error("Hotel API update error:", error);
        throw error;
      }
    },
    delete: async (id) => {
      try {
        console.log("Hotel API delete called with id:", id);
        const result = await deleteHotelDetails(id);
        console.log("Hotel API delete result:", result);
        return result;
      } catch (error) {
        console.error("Hotel API delete error:", error);
        throw error;
      }
    },
  },
};


