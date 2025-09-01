import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AddCustomerPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/customers", form);
      navigate("/customers"); // redirect after success
    } catch (err) {
      console.error("Error adding customer:", err);
      setError("Failed to add customer. Try again!");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
      
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block font-medium">First Name</label>
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Phone Number</label>
          <input
            type="tel"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
      </form>
    </div>
  );
}
