import fetch from "node-fetch";
import { data } from "./mockData.js";

const API_URL = "http://localhost:5000/api";

async function resetDatabase() {
  console.log("🗑️ Clearing old data...");

  // Delete addresses first (because of foreign key constraint)
  await fetch(`${API_URL}/addresses/clear`, { method: "DELETE" });

  // Delete customers
  await fetch(`${API_URL}/customers/clear`, { method: "DELETE" });

  console.log("✅ Database reset complete.");
}

async function seedDatabase() {
  await resetDatabase();

  for (const customer of data.customers) {
    try {
      // Create customer
      const res = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone_number: customer.phone_number,
        }),
      });

      const created = await res.json();

      if (!res.ok || created.error) {
        console.log("⚠️ Skipping customer:", created.error);
        continue;
      }

      console.log("Customer created:", created);
      const customerId = created.data.id;

      // Add addresses
      const addresses = data.addresses.filter((a) => a.customer_id === customer.id);
      for (const addr of addresses) {
        const resAddr = await fetch(`${API_URL}/customers/${customerId}/addresses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address_details: addr.address_details,
            city: addr.city,
            state: addr.state,
            pin_code: addr.pin_code,
          }),
        });

        const addrResult = await resAddr.json();
        if (!resAddr.ok || addrResult.error) {
          console.log("⚠️ Skipping address:", addrResult.error);
          continue;
        }

        console.log("Address created:", addrResult);
      }
    } catch (err) {
      console.error("❌ Error seeding customer:", err.message);
    }
  }

  console.log("🎉 Seeding complete!");
}

seedDatabase();
