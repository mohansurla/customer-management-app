// src/utils/transform.js

// ---------------- Customer ----------------
export const toApiCustomer = (c) => ({
  first_name: c.firstName,
  last_name: c.lastName,
  phone_number: c.phoneNumber,
});

export const fromApiCustomer = (c) => ({
  id: c.id,
  firstName: c.first_name,
  lastName: c.last_name,
  phoneNumber: c.phone_number,
});

// ---------------- Address ----------------
export const toApiAddress = (a) => ({
  address_details: a.addressDetails,
  city: a.city,
  state: a.state,
  pin_code: a.pinCode,
  is_default: a.isDefault ?? false,
});

export const fromApiAddress = (a) => ({
  id: a.id,
  customerId: a.customer_id,
  addressDetails: a.address_details,
  city: a.city,
  state: a.state,
  pinCode: a.pin_code,
  isDefault: a.is_default ?? false,
});
