import { Routes, Route, Link } from "react-router-dom"
import HomePage from "./pages/HomePage"
import CustomersPage from "./pages/CustomersPage"
import CustomerDetailsPage from "./pages/CustomerDetailsPage"
import AddCustomerPage from "./pages/AddCustomerPage"
import AddAddressPage from "./pages/AddAddressPage";
import EditCustomerPage from "./pages/EditCustomerPage";
import EditAddressPage from "./pages/EditAddressPage";

export default function App() {
  return (
    <div className="p-6">
      <nav className="flex gap-4 mb-6">
          <Link to="/" className="text-blue-500">Home</Link>
          <Link to="/customers" className="text-blue-500">Customers</Link>
          <Link to="/customers/add" className="text-blue-500">Add Customer</Link>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/add" element={<AddCustomerPage />} />
              <Route path="/customers/:id" element={<CustomerDetailsPage />} />
              <Route path="/customers/:id/add-address" element={<AddAddressPage />} />
              <Route path="/customers/:id/edit" element={<EditCustomerPage />} />
              <Route path="/addresses/:id/edit" element={<EditAddressPage />} />
          </Routes>
      </div>
    </div>
  )
}
