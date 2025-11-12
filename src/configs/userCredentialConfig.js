import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api/Credentials";

export const userCredentialConfig = {
  entity: "User",
  idField: "Username", // Unique primary identifier for users in your API
  fields: [
    {
      name: "Username",
      label: "Username",
      type: "text",
      required: true,
      placeholder: "Enter username",
      description: "Unique user identifier (used for login)",
      minWidth: 180,
      flex: 1.2,
      validate: (value) => {
        if (!value) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        if (value.length > 30) return "Username must be less than 30 characters";
        return true;
      },
    },
    {
      name: "Password",
      label: "Password",
      type: "password",
      required: true,
      placeholder: "Enter password",
      description: "Set a secure password for the user",
      showInGrid: false, // 🔹 Don’t expose password in grid
      minWidth: 180,
      flex: 1,
      validate: (value) => {
        if (!value) return "Password is required";
        if (value.length < 2) return "Password must be at least 2 characters";
        return true;
      },
    },
    {
      name: "Role",
      label: "Role",
      type: "select",
      required: true,
      placeholder: "Select role",
      description: "User access role within the system",
      options: [
        { value: "Super_Admin", label: "Super_Admin" },
        { value: "staff", label: "Staff" },
      ],
      minWidth: 150,
      flex: 1,
    },
    {
      name: "Hotel_ID",
      label: "Hotel ID",
      type: "text",
      required: false,
      placeholder: "Optional shop association",
      description: "Link user to a specific shop ID (if applicable)",
      minWidth: 140,
      flex: 1,
    },
    {
      name: "Created_AT",
      label: "Created At",
      type: "text",
      readonly: true,
      description: "User creation time",
      showInGrid: true,
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
        console.log("User API getAll called with filters:", filters);
        const result = await getUsers(filters);
        console.log("User API getAll result:", result);
        return result;
      } catch (error) {
        console.error("User API getAll error:", error);
        throw error;
      }
    },
    create: async (data) => {
      try {
        console.log("User API create called with data:", data);
        // ⚡ Don’t send Created_At when creating new
        const { Created_At, ...createData } = data;
        const result = await createUser(createData);
        console.log("User API create result:", result);
        return result;
      } catch (error) {
        console.error("User API create error:", error);
        throw error;
      }
    },
    update: async (data) => {
      try {
        console.log("User API update called with data:", data);
        const result = await updateUser(data);
        console.log("User API update result:", result);
        return result;
      } catch (error) {
        console.error("User API update error:", error);
        throw error;
      }
    },
    delete: async (username) => {
      try {
        console.log("User API delete called with username:", username);
        const result = await deleteUser(username);
        console.log("User API delete result:", result);
        return result;
      } catch (error) {
        console.error("User API delete error:", error);
        throw error;
      }
    },
  },
};