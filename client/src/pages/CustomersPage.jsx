import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import '../components/Button'


export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  // fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customers", {
        params: { page, limit, name: search }
      });
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  return (
    <div>
        <h2 className="text-xl font-bold mb-4">Customers</h2>

        {/* Search */}

        <div className="mb-4 flex justify-between">
            <input
                type="text"
                placeholder="Search by name..."
                className="border p-2 rounded w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <Link
                to="/customers/add"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                + Add Customer
            </Link>
        </div>

            
        {/* Customers Table */}
        {loading ? (
            <p>Loading...</p>
        ) : customers.length === 0 ? (
            <p>No customers found</p>
        ) : (
            <table className="table-auto border-collapse border border-gray-300 w-full">
            <thead>
                <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Phone</th>
                <th className="border px-4 py-2">Addresses</th>
                </tr>
            </thead>
            <tbody>
                {customers.map((c) => (
                <tr key={c.id}>
                    <td className="border px-4 py-2">{c.first_name} {c.last_name}</td>
                    <td className="border px-4 py-2">{c.phone_number}</td>
                    <td className="border px-4 py-2">
                    {c.address_count === 1
                        ? "Only One Address"
                        : `${c.address_count} Addresses`}
                    </td>
                    <td className="border px-4 py-2">
                        <Link
                            to={`/customers/${c.id}`}
                            className="text-blue-500 hover:underline mr-3"
                        >
                            View
                        </Link>
                        <Link
                            to={`/customers/${c.id}/edit`}
                            className="text-yellow-500 hover:underline mr-3"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={async () => {
                            if (window.confirm("Delete this customer?")) {
                                await api.delete(`/customers/${c.id}`);
                                window.location.reload(); // quick refresh
                            }
                            }}
                            className="text-red-500 hover:underline"
                        >
                            Delete
                        </button>
                    </td>

                </tr>
                ))}
            </tbody>
            </table>
        )}

        {/* Pagination */}
        <div className="flex gap-2 mt-4">
            <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
            >
            Prev
            </button>
            <span className="px-2">Page {page}</span>
            <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded"
            >
            Next
            </button>
        </div>
    </div>
  );
}
