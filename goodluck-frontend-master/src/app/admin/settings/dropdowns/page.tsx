"use client";

import { useState } from "react";
import { Settings, Plus, Trash2, Edit } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import dropdownOptionsData from "@/lib/mock-data/dropdown-options.json";

export default function DropdownManagerPage() {
  const [dropdowns, setDropdowns] = useState(dropdownOptionsData);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newItem, setNewItem] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const categories = [
    { key: "cities", label: "Cities", icon: "📍" },
    { key: "boards", label: "Boards", icon: "📚" },
    { key: "contactRoles", label: "Contact Roles", icon: "👤" },
    { key: "visitPurposes", label: "Visit Purposes", icon: "🎯" },
    { key: "subjects", label: "Subjects", icon: "📖" },
    { key: "travelModes", label: "Travel Modes", icon: "🚗" },
    { key: "feedbackCategories", label: "Feedback Categories", icon: "💬" },
  ];

  const handleAddItem = () => {
    if (selectedCategory && newItem.trim()) {
      const updatedDropdowns = { ...dropdowns };
      (updatedDropdowns as any)[selectedCategory].push(newItem);
      setDropdowns(updatedDropdowns);
      toast.success("Item added successfully!");
      setNewItem("");
      setIsDialogOpen(false);
    }
  };

  const handleDeleteItem = (category: string, item: string) => {
    const updatedDropdowns = { ...dropdowns };
    (updatedDropdowns as any)[category] = (updatedDropdowns as any)[category].filter(
      (i: string) => i !== item
    );
    setDropdowns(updatedDropdowns);
    toast.success("Item deleted successfully!");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Dropdown Manager"
        description="Manage all dropdown options across the system"
      />

      <div className="grid gap-4">
        {categories.map((category) => {
          const items = (dropdowns as any)[category.key] || [];

          return (
            <Card key={category.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.label}
                    <Badge variant="secondary">{items.length} items</Badge>
                  </CardTitle>
                  <Dialog
                    open={isDialogOpen && selectedCategory === category.key}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (open) setSelectedCategory(category.key);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New {category.label}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="newItem">Item Name</Label>
                          <Input
                            id="newItem"
                            placeholder="Enter item name"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false);
                              setNewItem("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddItem}>Add Item</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {items.map((item: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{item}</span>
                      <button
                        onClick={() => handleDeleteItem(category.key, item)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
