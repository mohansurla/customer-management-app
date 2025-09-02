import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Phone, MapPin, Edit, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export function CustomerCard({ customer, addresses, onEdit, onDelete }) {
  const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
  const addressCount = addresses.length;

  return (
    <Card className="group bg-gradient-card border-border/40 backdrop-blur-sm hover:shadow-medium transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {customer.firstName} {customer.lastName}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="text-sm">{customer.phoneNumber}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={addressCount === 1 ? "warning" : "success"} className="text-xs">
              {addressCount === 1 ? "Single Address" : `${addressCount} Addresses`}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {defaultAddress && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="space-y-1 min-w-0">
              <p className="text-sm text-foreground line-clamp-2">{defaultAddress.addressDetails}</p>
              <p className="text-xs text-muted-foreground">
                {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pinCode}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Button 
            asChild 
            variant="outline" 
            size="sm" 
            className="flex-1 group-hover:border-primary/50 transition-colors"
          >
            <Link to={`/customers/${customer.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(customer)}
            className="hover:border-primary/50 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(customer.id)}
            className="hover:border-destructive hover:text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}