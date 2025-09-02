import fetch from "node-fetch";

import { data } from "./mockData.js";


const API_URL = "http://localhost:5000/api";

async function seedDatabase() {
  for (const customer of data.customers) {
    // Create customer
    const res = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone_number: customer.phone_number
      })
    });

    const created = await res.json();
    console.log("Customer created:", created);

    const customerId = created.data.id;

    // Add addresses belonging to this customer
    const addresses = data.addresses.filter(a => a.customer_id === customer.id);
    for (const addr of addresses) {
      const resAddr = await fetch(`${API_URL}/customers/${customerId}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address_details: addr.address_details,
          city: addr.city,
          state: addr.state,
          pin_code: addr.pin_code
        })
      });
      console.log("Address created:", await resAddr.json());
    }
  }
}

seedDatabase();
