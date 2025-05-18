
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FiltersProps {
  onFilterChange: (filters: {
    category: string;
    division: string;
    neighborhood: string;
    premises_type: string;
  }) => void;
}

const TorontoDataFilters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [premisesTypes, setPremisesTypes] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    category: "",
    division: "",
    neighborhood: "",
    premises_type: ""
  });

  useEffect(() => {
    // Fetch unique values for filter dropdowns
    fetchUniqueValues();
  }, []);

  const fetchUniqueValues = async () => {
    try {
      // Get unique categories
      const { data: categoryData } = await supabase
        .from('toronto_police_incidents')
        .select('category')
        .not('category', 'is', null)
        .limit(50);
      
      // Get unique divisions
      const { data: divisionData } = await supabase
        .from('toronto_police_incidents')
        .select('division')
        .not('division', 'is', null)
        .limit(50);
      
      // Get unique neighborhoods
      const { data: neighborhoodData } = await supabase
        .from('toronto_police_incidents')
        .select('neighborhood')
        .not('neighborhood', 'is', null)
        .limit(50);
      
      // Get unique premises types
      const { data: premisesData } = await supabase
        .from('toronto_police_incidents')
        .select('premises_type')
        .not('premises_type', 'is', null)
        .limit(50);

      if (categoryData) {
        const uniqueCategories = Array.from(new Set(categoryData.map(item => item.category as string)));
        setCategories(uniqueCategories);
      }
      
      if (divisionData) {
        const uniqueDivisions = Array.from(new Set(divisionData.map(item => item.division as string)));
        setDivisions(uniqueDivisions);
      }
      
      if (neighborhoodData) {
        const uniqueNeighborhoods = Array.from(new Set(neighborhoodData.map(item => item.neighborhood as string)));
        setNeighborhoods(uniqueNeighborhoods);
      }
      
      if (premisesData) {
        const uniquePremises = Array.from(new Set(premisesData.map(item => item.premises_type as string)));
        setPremisesTypes(uniquePremises);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      category: "",
      division: "",
      neighborhood: "",
      premises_type: ""
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          list="categories"
          placeholder="Type or select category"
          value={filters.category}
          onChange={handleInputChange}
        />
        <datalist id="categories">
          {categories.map((category, index) => (
            <option key={index} value={category} />
          ))}
        </datalist>
      </div>

      <div className="space-y-2">
        <Label htmlFor="division">Division</Label>
        <Input
          id="division"
          name="division"
          list="divisions"
          placeholder="Type or select division"
          value={filters.division}
          onChange={handleInputChange}
        />
        <datalist id="divisions">
          {divisions.map((division, index) => (
            <option key={index} value={division} />
          ))}
        </datalist>
      </div>

      <div className="space-y-2">
        <Label htmlFor="neighborhood">Neighborhood</Label>
        <Input
          id="neighborhood"
          name="neighborhood"
          list="neighborhoods"
          placeholder="Type or select neighborhood"
          value={filters.neighborhood}
          onChange={handleInputChange}
        />
        <datalist id="neighborhoods">
          {neighborhoods.map((neighborhood, index) => (
            <option key={index} value={neighborhood} />
          ))}
        </datalist>
      </div>

      <div className="space-y-2">
        <Label htmlFor="premises_type">Premises Type</Label>
        <Input
          id="premises_type"
          name="premises_type"
          list="premises_types"
          placeholder="Type or select premises"
          value={filters.premises_type}
          onChange={handleInputChange}
        />
        <datalist id="premises_types">
          {premisesTypes.map((type, index) => (
            <option key={index} value={type} />
          ))}
        </datalist>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">Apply Filters</Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleReset}
          className="flex-1"
        >
          Reset
        </Button>
      </div>
    </form>
  );
};

export default TorontoDataFilters;
