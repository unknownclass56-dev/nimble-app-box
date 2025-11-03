import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Package, BarChart3, MessageSquare, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ManageAppsTab from "@/components/ManageAppsTab";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ totalApps: 0, totalDownloads: 0, pendingTickets: 0 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        title: "Access denied",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const [appsResult, ticketsResult] = await Promise.all([
        supabase.from("apps").select("id, download_count").eq("deleted", false),
        supabase.from("support_tickets").select("id").eq("status", "new"),
      ]);

      const totalApps = appsResult.data?.length || 0;
      const totalDownloads = appsResult.data?.reduce((sum, app) => sum + (app.download_count || 0), 0) || 0;
      const pendingTickets = ticketsResult.data?.length || 0;

      setStats({ totalApps, totalDownloads, pendingTickets });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an exe file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const category = formData.get("category") as "productivity" | "photography" | "health" | "entertainment" | "utilities" | "education";
    
    try {
      // Upload file to storage
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const filePath = `apps/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("app-files")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("app-files")
        .getPublicUrl(filePath);

      const fileSizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);

      const appData = {
        title: formData.get("appName") as string,
        slug: (formData.get("appName") as string).toLowerCase().replace(/\s+/g, "-"),
        package_name: formData.get("packageName") as string,
        category: category,
        short_description: formData.get("shortDesc") as string,
        long_description: formData.get("longDesc") as string,
        current_version: formData.get("version") as string,
        min_os: formData.get("minOS") as string,
        file_size: `${fileSizeInMB} MB`,
        icon_url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&h=200&fit=crop",
        created_by: user?.id,
      };

      const { data, error } = await supabase
        .from("apps")
        .insert([appData])
        .select()
        .single();

      if (error) throw error;

      // Add version entry
      await supabase.from("app_versions").insert([{
        app_id: data.id,
        version: appData.current_version,
        file_url: urlData.publicUrl,
        file_key: filePath,
        release_notes: formData.get("releaseNotes") as string,
      }]);

      toast({
        title: "App uploaded successfully",
        description: "Your app has been published and is now available for download.",
      });

      (e.target as HTMLFormElement).reset();
      setSelectedFile(null);
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const statItems = [
    { label: "Total Apps", value: stats.totalApps.toString(), icon: Package },
    { label: "Total Downloads", value: stats.totalDownloads.toLocaleString(), icon: BarChart3 },
    { label: "Pending Tickets", value: stats.pendingTickets.toString(), icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statItems.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="h-10 w-10 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload App
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Package className="mr-2 h-4 w-4" />
              Manage Apps
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <MessageSquare className="mr-2 h-4 w-4" />
              Support Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload New App</CardTitle>
                <CardDescription>
                  Fill in the details and upload your app file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="appName">App Name *</Label>
                      <Input id="appName" name="appName" required placeholder="My Awesome App" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packageName">Package Name *</Label>
                      <Input id="packageName" name="packageName" required placeholder="com.example.app" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="productivity">Productivity</SelectItem>
                          <SelectItem value="photography">Photography</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version">Version *</Label>
                      <Input id="version" name="version" required placeholder="1.0.0" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDesc">Short Description *</Label>
                    <Input id="shortDesc" name="shortDesc" required placeholder="Brief description (max 80 characters)" maxLength={80} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDesc">Long Description *</Label>
                    <Textarea id="longDesc" name="longDesc" required placeholder="Detailed description of your app..." rows={5} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="releaseNotes">Release Notes *</Label>
                    <Textarea id="releaseNotes" name="releaseNotes" required placeholder="What's new in this version..." rows={4} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minOS">Minimum OS *</Label>
                    <Input id="minOS" name="minOS" required placeholder="Windows 10+" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appFile">App File (EXE) *</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        id="appFile" 
                        type="file" 
                        accept=".exe"
                        required
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">
                          {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" size="lg" disabled={uploading} className="w-full">
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-5 w-5" />
                        Upload App
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <ManageAppsTab onAppDeleted={fetchStats} />
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Respond to user support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Support ticket management coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
