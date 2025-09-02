import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { X, Save, MapPin } from "lucide-react";

export function AddressForm({ address, customerId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    customerId,
    addressDetails: address?.addressDetails || '',
    city: address?.city || '',
    state: address?.state || '',
    pinCode: address?.pinCode || '',
    isDefault: address?.isDefault || false
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.addressDetails.trim()) {
      newErrors.addressDetails = 'Address details are required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'PIN code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-background border-border/60 shadow-strong">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {address ? 'Edit Address' : 'Add New Address'}
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="hover:border-destructive hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addressDetails">Address Details *</Label>
              <Textarea
                id="addressDetails"
                value={formData.addressDetails}
                onChange={(e) => handleChange('addressDetails', e.target.value)}
                className={errors.addressDetails ? 'border-destructive' : ''}
                placeholder="Enter complete address (Street, Building, Landmark)"
                rows={3}
              />
              {errors.addressDetails && (
                <p className="text-sm text-destructive">{errors.addressDetails}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={errors.city ? 'border-destructive' : ''}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={errors.state ? 'border-destructive' : ''}
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pinCode">PIN Code *</Label>
              <Input
                id="pinCode"
                value={formData.pinCode}
                onChange={(e) => handleChange('pinCode', e.target.value)}
                className={errors.pinCode ? 'border-destructive' : ''}
                placeholder="Enter 6-digit PIN code"
                maxLength={6}
              />
              {errors.pinCode && (
                <p className="text-sm text-destructive">{errors.pinCode}</p>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {address ? 'Update Address' : 'Add Address'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}