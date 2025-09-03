import { useState, useMemo, useEffect } from "react";
import api from "../api/axios";
import { CustomerCard } from "../components/CustomerCard";
import { CustomerForm } from "../components/CustomerForm";
import { SearchAndFilter } from "../components/SearchAndFilter";
import { Button } from "../components/ui/button";
import { Users, MapPin, Plus } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { toApiCustomer, fromApiCustomer } from "../utils/transform";


export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { toast } = useToast();

  // ✅ Fetch customers + addresses from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/customers?limit=100");
        setCustomers(res.data.data.map(fromApiCustomer));

        // fetch all addresses
        const allAddresses = [];
        for (const c of res.data.data) {
          const addrRes = await api.get(`/customers/${c.id}/addresses`);
          allAddresses.push(...addrRes.data.data);
        }
        setAddresses(allAddresses);
      } catch (err) {
        console.error("❌ Error fetching customers", err);
      }
    };
    fetchData();
  }, []);

  // Unique cities/states
  const { cities, states } = useMemo(() => {
    const uniqueCities = [...new Set(addresses.map((addr) => addr.city))].sort();
    const uniqueStates = [...new Set(addresses.map((addr) => addr.state))].sort();
    return { cities: uniqueCities, states: uniqueStates };
  }, [addresses]);

  // Filters
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        searchTerm === "" ||
        customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone_number.includes(searchTerm);

      const customerAddresses = addresses.filter(
        (addr) => addr.customer_id === customer.id
      );

      const matchesCity =
        cityFilter === "" ||
        cityFilter === "all" ||
        customerAddresses.some((addr) => addr.city === cityFilter);

      const matchesState =
        stateFilter === "" ||
        stateFilter === "all" ||
        customerAddresses.some((addr) => addr.state === stateFilter);

      return matchesSearch && matchesCity && matchesState;
    });
  }, [customers, addresses, searchTerm, cityFilter, stateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ✅ Save customer (API)
  const handleSaveCustomer = async (customerData) => {
    try {
      if (editingCustomer) {
        const res = await api.put(`/customers/${editingCustomer.id}`, toApiCustomer(customerData));
        setCustomers((prev) =>
          prev.map((c) => (c.id === editingCustomer.id ? fromApiCustomer(res.data.data) : c))
        );
        toast({ title: "Customer Updated ✅" });
      } else {
        const res = await api.post("/customers", toApiCustomer(customerData));
        setCustomers((prev) => [fromApiCustomer(res.data.data), ...prev]);
        toast({ title: "Customer Created ✅" });
      }
      setShowCustomerForm(false);
      setEditingCustomer(null);
    } catch (err) {
      console.error("❌ Error saving customer", err);
    }
  };

  // ✅ Edit
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  // ✅ Delete
  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm("Delete this customer and all addresses?")) return;
    try {
      await api.delete(`/customers/${customerId}`);
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      setAddresses((prev) => prev.filter((a) => a.customer_id !== customerId));
      toast({ title: "Customer Deleted 🗑️", variant: "destructive" });
    } catch (err) {
      console.error("❌ Error deleting customer", err);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCityFilter("");
    setStateFilter("");
    setCurrentPage(1);
  };

  const getCustomerAddresses = (customerId) =>
    addresses.filter((addr) => addr.customer_id === customerId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Customer Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your customers and their addresses efficiently
            </p>
          </div>
          <Button
            onClick={() => setShowCustomerForm(true)}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-card p-4 rounded-lg border border-border/40 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">{customers.length}</p>
            </div>
          </div>
          <div className="bg-gradient-card p-4 rounded-lg border border-border/40 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Total Addresses</p>
              <p className="text-2xl font-bold">{addresses.length}</p>
            </div>
          </div>
          <div className="bg-gradient-card p-4 rounded-lg border border-border/40 flex items-center gap-3">
            <Users className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Filtered Results</p>
              <p className="text-2xl font-bold">{filteredCustomers.length}</p>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          cityFilter={cityFilter}
          onCityFilterChange={setCityFilter}
          stateFilter={stateFilter}
          onStateFilterChange={setStateFilter}
          onClearFilters={handleClearFilters}
          cities={cities}
          states={states}
        />

        {/* Customers */}
        <div className="mt-6 space-y-6">
          {paginatedCustomers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    addresses={getCustomerAddresses(customer.id)}
                    onEdit={handleEditCustomer}
                    onDelete={handleDeleteCustomer}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No customers found 😢</p>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {showCustomerForm && (
          <CustomerForm
            customer={editingCustomer}
            onSave={handleSaveCustomer}
            onCancel={() => {
              setShowCustomerForm(false);
              setEditingCustomer(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
