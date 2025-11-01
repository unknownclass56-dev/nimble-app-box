import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Shield, Zap } from "lucide-react";
import AppCard from "@/components/AppCard";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { isAdmin } = useAuth();
  const [featuredApps, setFeaturedApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedApps();
  }, []);

  const fetchFeaturedApps = async () => {
    try {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("deleted", false)
        .order("download_count", { ascending: false })
        .limit(4);

      if (error) throw error;

      setFeaturedApps(
        data?.map((app) => ({
          id: app.id,
          title: app.title,
          category: app.category,
          shortDescription: app.short_description,
          iconUrl: app.icon_url || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&h=200&fit=crop",
          downloadCount: app.download_count,
          rating: app.rating,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: "Productivity", count: 234, icon: Zap },
    { name: "Photography", count: 189, icon: Smartphone },
    { name: "Health", count: 156, icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-background" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover Amazing Apps
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Browse, download, and enjoy thousands of applications. All in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse">
                <Button size="lg" className="group">
                  Browse Apps
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button size="lg" variant="outline">
                    Admin Portal
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Popular Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/browse?category=${category.name.toLowerCase()}`}
              className="group"
            >
              <div className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <category.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-muted-foreground">{category.count} apps</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Apps */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Apps</h2>
          <Link to="/browse">
            <Button variant="ghost">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading apps...</p>
          </div>
        ) : featuredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredApps.map((app) => (
              <AppCard key={app.id} {...app} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No apps available yet.</p>
            {isAdmin && (
              <Link to="/admin">
                <Button className="mt-4">Upload Your First App</Button>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground">© 2024 AppStore. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors">
                Support
              </Link>
              <Link to="/browse" className="text-muted-foreground hover:text-primary transition-colors">
                Browse
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
