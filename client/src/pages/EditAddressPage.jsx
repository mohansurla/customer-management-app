import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

export default function EditAddressPage() {
  const { id } = useParams(); // address id
  const navigate = useNavigate();
  const [form, setForm] = useState({
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
  });

  useEffect(() => {
    api.get(`/addresses/${id}`).then((res) => setForm(res.data));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.put(`/addresses/${id}`, form);
    navigate(-1); // go back to customer details page
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Edit Address</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="text"
          name="street"
          value={form.street}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="city"
          value={form.city}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="state"
          value={form.state}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="zip_code"
          value={form.zip_code}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="country"
          value={form.country}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
}
