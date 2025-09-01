import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

export default function AddAddressPage() {
  const { id } = useParams(); // customer id
  const navigate = useNavigate();

  const [form, setForm] = useState({
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post(`/customers/${id}/addresses`, form);
      navigate(`/customers/${id}`); // redirect back to customer details
    } catch (err) {
      console.error("Error adding address:", err);
      setError("Failed to add address. Try again!");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Add Address</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block font-medium">Street</label>
          <input
            type="text"
            name="street"
            value={form.street}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">City</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">State</label>
          <input
            type="text"
            name="state"
            value={form.state}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">ZIP Code</label>
          <input
            type="text"
            name="zip_code"
            value={form.zip_code}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Country</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save Address
        </button>
      </form>
    </div>
  );
}
