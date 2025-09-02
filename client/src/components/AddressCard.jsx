import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge"; 
import { Button } from "./ui/button";
import { MapPin, Edit, Trash2, Star } from "lucide-react";

export function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  return (
    <Card className="group bg-gradient-card border-border/40 hover:shadow-medium transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-foreground">Address</h3>
          </div>
          <div className="flex items-center gap-2">
            {address.isDefault && (
              <Badge variant="success" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Default
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm text-foreground leading-relaxed">{address.addressDetails}</p>
            <p className="text-sm text-muted-foreground">
              {address.city}, {address.state} - {address.pinCode}
            </p>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            {!address.isDefault && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSetDefault(address.id)}
                className="text-xs hover:border-primary/50 transition-colors"
              >
                <Star className="h-3 w-3 mr-1" />
                Set Default
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(address)}
              className="hover:border-primary/50 transition-colors"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(address.id)}
              className="hover:border-destructive hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}