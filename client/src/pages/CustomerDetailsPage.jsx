import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await api.get(`/customers/${id}`);
        setCustomer(res.data);
      } catch (err) {
        console.error("Error fetching customer:", err);
        setError("Failed to load customer details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {customer.first_name} {customer.last_name}
      </h2>
      <p className="mb-4 text-gray-600">📞 {customer.phone_number}</p>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Addresses</h3>
        {customer.addresses.length === 0 ? (
          <p className="text-gray-500">No addresses yet.</p>
        ) : (
          <ul className="space-y-3">
            {customer.addresses.map((addr) => (
                <li key={addr.id} className="border p-3 rounded flex justify-between items-center">
                    <div>
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} - {addr.zip_code}</p>
                        <p className="text-gray-500">📍 {addr.country}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                        to={`/addresses/${addr.id}/edit`}
                        className="text-yellow-500 hover:underline"
                        >
                        Edit
                        </Link>
                        <button
                        onClick={async () => {
                            if (window.confirm("Delete this address?")) {
                            await api.delete(`/addresses/${addr.id}`);
                            window.location.reload();
                            }
                        }}
                        className="text-red-500 hover:underline"
                        >
                        Delete
                        </button>
                    </div>
                </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        to={`/customers/${id}/add-address`}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Add Address
      </Link>
    </div>
  );
}
