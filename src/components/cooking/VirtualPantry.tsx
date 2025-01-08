import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

interface PantryItem extends Tables<"pantry_items"> {}

export const VirtualPantry = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState({ name: "", quantity: 1, unit: "", expiry_date: "" });
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const fetchPantryItems = async () => {
    try {
      const { data, error } = await supabase
        .from("pantry_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching pantry items:", error);
      toast.error("Failed to load pantry items");
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.name.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Please log in to add items");
        return;
      }

      const { error } = await supabase.from("pantry_items").insert({
        name: newItem.name,
        quantity: newItem.quantity,
        unit: newItem.unit || null,
        expiry_date: newItem.expiry_date || null,
        user_id: session.user.id
      });

      if (error) throw error;

      toast.success("Item added successfully");
      setNewItem({ name: "", quantity: 1, unit: "", expiry_date: "" });
      fetchPantryItems();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select items to delete");
      return;
    }

    try {
      const { error } = await supabase
        .from("pantry_items")
        .delete()
        .in("id", selectedItems);

      if (error) throw error;

      toast.success("Items deleted successfully");
      setSelectedItems([]);
      fetchPantryItems();
    } catch (error) {
      console.error("Error deleting items:", error);
      toast.error("Failed to delete items");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Virtual Pantry</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
            min="1"
          />
          <Input
            placeholder="Unit (e.g., kg, pieces)"
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
          />
          <Input
            type="date"
            value={newItem.expiry_date}
            onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
          />
        </div>
        
        <Button onClick={addItem} className="w-full md:w-auto">
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {selectedItems.length > 0 && (
          <Button variant="destructive" onClick={deleteSelectedItems}>
            Delete Selected ({selectedItems.length})
          </Button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors"
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) => {
                    setSelectedItems(
                      checked
                        ? [...selectedItems, item.id]
                        : selectedItems.filter((id) => id !== item.id)
                    );
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} {item.unit}
                  </p>
                  {item.expiry_date && (
                    <p className="text-sm text-gray-600">
                      Expires: {format(new Date(item.expiry_date), "PP")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};