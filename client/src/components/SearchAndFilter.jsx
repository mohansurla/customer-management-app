import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Filter, X } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function SearchAndFilter({
  searchTerm,
  onSearchChange,
  cityFilter,
  onCityFilterChange,
  stateFilter,
  onStateFilterChange,
  onClearFilters,
  cities,
  states
}) {
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = cityFilter || stateFilter;

  return (
    <Card className="bg-gradient-card border-border/40">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name or phone..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background/50 border-border/60 focus:border-primary/60"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters ? 'bg-primary/10 border-primary/30' : ''} transition-colors`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {[cityFilter, stateFilter].filter(Boolean).length}
                </span>
              )}
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="hover:border-destructive hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-border/40">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Filter by City</label>
                <Select value={cityFilter} onValueChange={onCityFilterChange}>
                  <SelectTrigger className="bg-background/50 border-border/60">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Filter by State</label>
                <Select value={stateFilter} onValueChange={onStateFilterChange}>
                  <SelectTrigger className="bg-background/50 border-border/60">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}