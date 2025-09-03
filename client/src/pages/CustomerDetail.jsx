import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AddressCard } from "../components/AddressCard";
import { AddressForm } from "../components/AddressForm";
import { CustomerForm } from "../components/CustomerForm";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, Plus, Phone, Calendar, Edit, Trash2, User, MapPin } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { toApiCustomer, fromApiCustomer, toApiAddress, fromApiAddress } from "../utils/transform";


export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // ✅ Fetch customer + addresses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/customers/${id}`);
        setCustomer(fromApiCustomer(res.data.data));
        const addrRes = await api.get(`/customers/${id}/addresses`);
        setAddresses(addrRes.data.data.map(fromApiAddress));
      } catch (err) {
        console.error("❌ Error loading customer", err);
      }
    };
    fetchData();
  }, [id]);

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Customer Not Found</p>
      </div>
    );
  }

  // ✅ Update customer
  const handleUpdateCustomer = async (customerData) => {
    try {
      const res = await api.put(`/customers/${id}`, toApiCustomer(customerData));
      setCustomer(fromApiCustomer(res.data.data));
      toast({ title: "Customer Updated ✅" });
      setShowCustomerForm(false);
    } catch (err) {
      console.error("❌ Error updating customer", err);
    }
  };

  // ✅ Delete customer
  const handleDeleteCustomer = async () => {
    if (!window.confirm("Delete this customer and all addresses?")) return;
    try {
      await api.delete(`/customers/${id}`);
      toast({ title: "Customer Deleted 🗑️", variant: "destructive" });
      navigate("/");
    } catch (err) {
      console.error("❌ Error deleting customer", err);
    }
  };

  // ✅ Save address (create or update)
  const handleSaveAddress = async (addressData) => {
    try {
      if (editingAddress) {
        const res = await api.put(`/addresses/${editingAddress.id}`, toApiAddress(addressData));
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingAddress.id ? fromApiAddress(res.data.data) : a))
        );
        toast({ title: "Address Updated ✅" });
      } else {
        const res = await api.post(`/customers/${id}/addresses`, toApiAddress(addressData));
        setAddresses((prev) => [...prev, fromApiAddress(res.data.data)]);
        toast({ title: "Address Added ✅" });
      }
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (err) {
      console.error("❌ Error saving address", err);
    }
  };

  // ✅ Delete address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await api.delete(`/addresses/${addressId}`);
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      toast({ title: "Address Deleted 🗑️", variant: "destructive" });
    } catch (err) {
      console.error("❌ Error deleting address", err);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Customers
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">
              {customer.first_name} {customer.last_name}
            </h1>
            <p className="text-muted-foreground">Customer Details & Addresses</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCustomerForm(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button
              onClick={handleDeleteCustomer}
              variant="outline"
              className="hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Phone:</strong> {customer.phone_number}</p>
              <p><strong>Created:</strong> {formatDate(customer.createdAt || Date.now())}</p>
            </CardContent>
          </Card>

          {/* Addresses */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" /> Addresses
                <Badge>{addresses.length}</Badge>
              </h2>
              <Button
                onClick={() => setShowAddressForm(true)}
                className="bg-gradient-primary"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Address
              </Button>
            </div>

            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onEdit={() => {
                    setEditingAddress(addr);
                    setShowAddressForm(true);
                  }}
                  onDelete={() => handleDeleteAddress(addr.id)}
                />
              ))
            ) : (
              <p>No addresses found</p>
            )}
          </div>
        </div>

        {/* Forms */}
        {showCustomerForm && (
          <CustomerForm
            customer={customer}
            onSave={handleUpdateCustomer}
            onCancel={() => setShowCustomerForm(false)}
          />
        )}
        {showAddressForm && (
          <AddressForm
            address={editingAddress}
            customerId={id}
            onSave={handleSaveAddress}
            onCancel={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
