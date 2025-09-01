import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function EditCustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", phone_number: "" });

  useEffect(() => {
    api.get(`/customers/${id}`).then((res) => setForm(res.data));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.put(`/customers/${id}`, form);
    navigate("/customers");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Edit Customer</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="text"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          required
          placeholder="First Name"
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          required
          placeholder="Last Name"
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          name="phone_number"
          value={form.phone_number}
          onChange={handleChange}
          required
          placeholder="Phone Number"
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
}
