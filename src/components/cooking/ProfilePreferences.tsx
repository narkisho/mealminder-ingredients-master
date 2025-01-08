import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const SKILL_LEVELS = ["beginner", "intermediate", "advanced"];
const DIETARY_OPTIONS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "keto",
  "paleo",
];
const EQUIPMENT_OPTIONS = [
  "oven",
  "stovetop",
  "microwave",
  "blender",
  "food processor",
  "slow cooker",
  "pressure cooker",
];
const CUISINE_OPTIONS = [
  "italian",
  "mexican",
  "chinese",
  "japanese",
  "indian",
  "mediterranean",
  "american",
];

interface TimePreferences {
  weekday: number;
  weekend: number;
}

const DEFAULT_TIME_PREFERENCES: TimePreferences = {
  weekday: 30,
  weekend: 60,
};

export const ProfilePreferences = () => {
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);
  const [timePreferences, setTimePreferences] = useState<TimePreferences>(DEFAULT_TIME_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Please log in to manage preferences");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      if (profile) {
        setSkillLevel(profile.cooking_skill_level);
        setDietaryPreferences(profile.dietary_preferences || []);
        setEquipment(profile.available_equipment || []);
        setCuisinePreferences(profile.cuisine_preferences || []);
        
        // Safely handle time preferences
        const savedTimePreferences = profile.time_preferences as TimePreferences;
        if (savedTimePreferences && 
            typeof savedTimePreferences.weekday === 'number' && 
            typeof savedTimePreferences.weekend === 'number') {
          setTimePreferences(savedTimePreferences);
        } else {
          setTimePreferences(DEFAULT_TIME_PREFERENCES);
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Please log in to save preferences");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          cooking_skill_level: skillLevel,
          dietary_preferences: dietaryPreferences,
          available_equipment: equipment,
          cuisine_preferences: cuisinePreferences,
          time_preferences: timePreferences,
        })
        .eq("id", session.user.id);

      if (error) throw error;
      toast.success("Preferences saved successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    }
  };

  const togglePreference = (
    array: string[],
    setArray: (value: string[]) => void,
    value: string
  ) => {
    if (array.includes(value)) {
      setArray(array.filter((item) => item !== value));
    } else {
      setArray([...array, value]);
    }
  };

  if (loading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div className="space-y-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
      <h2 className="text-2xl font-display font-bold text-gray-800">Cooking Preferences</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cooking Skill Level
          </label>
          <Select
            value={skillLevel || ""}
            onValueChange={(value) => setSkillLevel(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your cooking skill level" />
            </SelectTrigger>
            <SelectContent>
              {SKILL_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((diet) => (
              <Badge
                key={diet}
                variant={dietaryPreferences.includes(diet) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => togglePreference(dietaryPreferences, setDietaryPreferences, diet)}
              >
                {diet}
                {dietaryPreferences.includes(diet) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Equipment
          </label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((item) => (
              <Badge
                key={item}
                variant={equipment.includes(item) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => togglePreference(equipment, setEquipment, item)}
              >
                {item}
                {equipment.includes(item) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cuisine Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((cuisine) => (
              <Badge
                key={cuisine}
                variant={cuisinePreferences.includes(cuisine) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => togglePreference(cuisinePreferences, setCuisinePreferences, cuisine)}
              >
                {cuisine}
                {cuisinePreferences.includes(cuisine) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Preferences (minutes)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weekday</label>
              <input
                type="number"
                value={timePreferences.weekday}
                onChange={(e) =>
                  setTimePreferences({
                    ...timePreferences,
                    weekday: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                max="180"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weekend</label>
              <input
                type="number"
                value={timePreferences.weekend}
                onChange={(e) =>
                  setTimePreferences({
                    ...timePreferences,
                    weekend: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                max="180"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={savePreferences}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};