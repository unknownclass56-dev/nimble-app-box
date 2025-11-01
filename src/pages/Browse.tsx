import { useState } from "react";
import Navbar from "@/components/Navbar";
import AppCard from "@/components/AppCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  // Mock apps data
  const apps = [
    {
      id: "1",
      title: "Photo Editor Pro",
      category: "Photography",
      shortDescription: "Professional photo editing tools with AI enhancement",
      iconUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&h=200&fit=crop",
      downloadCount: 125000,
      rating: 4.8,
    },
    {
      id: "2",
      title: "Task Manager",
      category: "Productivity",
      shortDescription: "Organize your tasks and boost productivity",
      iconUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=200&h=200&fit=crop",
      downloadCount: 89000,
      rating: 4.6,
    },
    {
      id: "3",
      title: "Fitness Tracker",
      category: "Health",
      shortDescription: "Track workouts, calories, and health metrics",
      iconUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop",
      downloadCount: 203000,
      rating: 4.7,
    },
    {
      id: "4",
      title: "Music Player",
      category: "Entertainment",
      shortDescription: "High-quality audio player with equalizer",
      iconUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop",
      downloadCount: 156000,
      rating: 4.9,
    },
    {
      id: "5",
      title: "Note Taking App",
      category: "Productivity",
      shortDescription: "Capture ideas and organize notes efficiently",
      iconUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=200&h=200&fit=crop",
      downloadCount: 76000,
      rating: 4.5,
    },
    {
      id: "6",
      title: "Weather Forecast",
      category: "Utilities",
      shortDescription: "Accurate weather predictions and live radar",
      iconUrl: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=200&h=200&fit=crop",
      downloadCount: 112000,
      rating: 4.4,
    },
  ];

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || app.category.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Browse Apps</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="productivity">Productivity</SelectItem>
              <SelectItem value="photography">Photography</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            Showing {filteredApps.length} {filteredApps.length === 1 ? 'app' : 'apps'}
          </p>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <AppCard key={app.id} {...app} />
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No apps found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
