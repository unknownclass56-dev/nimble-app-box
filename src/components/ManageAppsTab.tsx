import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";

interface ManageAppsTabProps {
  onAppDeleted?: () => void;
}

const ManageAppsTab = ({ onAppDeleted }: ManageAppsTabProps) => {
  const { toast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApps(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching apps",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appId: string) => {
    setDeletingId(appId);
    try {
      const { error } = await supabase
        .from("apps")
        .update({ deleted: true })
        .eq("id", appId);

      if (error) throw error;

      toast({
        title: "App deleted",
        description: "The app has been successfully deleted.",
      });

      fetchApps();
      onAppDeleted?.();
    } catch (error: any) {
      toast({
        title: "Error deleting app",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Apps</CardTitle>
        <CardDescription>View and manage your published apps</CardDescription>
      </CardHeader>
      <CardContent>
        {apps.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No apps found. Upload your first app to get started.</p>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={app.icon_url || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&h=100&fit=crop"}
                    alt={app.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{app.title}</h3>
                    <p className="text-sm text-muted-foreground">{app.short_description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">v{app.current_version}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{app.download_count || 0} downloads</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground capitalize">{app.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/app/${app.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={deletingId === app.id}>
                        {deletingId === app.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete "{app.title}" from the store. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(app.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageAppsTab;
