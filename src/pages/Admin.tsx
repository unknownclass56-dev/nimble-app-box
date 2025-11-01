import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Package, BarChart3, MessageSquare, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    setTimeout(() => {
      setUploading(false);
      toast({
        title: "App uploaded successfully",
        description: "Your app has been published and is now available for download.",
      });
    }, 2000);
  };

  const stats = [
    { label: "Total Apps", value: "24", icon: Package },
    { label: "Total Downloads", value: "1.2M", icon: BarChart3 },
    { label: "Pending Tickets", value: "8", icon: MessageSquare },
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
          {stats.map((stat) => (
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
                      <Input id="appName" required placeholder="My Awesome App" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packageName">Package Name *</Label>
                      <Input id="packageName" required placeholder="com.example.app" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="productivity">Productivity</SelectItem>
                          <SelectItem value="photography">Photography</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version">Version *</Label>
                      <Input id="version" required placeholder="1.0.0" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDesc">Short Description *</Label>
                    <Input id="shortDesc" required placeholder="Brief description (max 80 characters)" maxLength={80} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDesc">Long Description *</Label>
                    <Textarea id="longDesc" required placeholder="Detailed description of your app..." rows={5} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="releaseNotes">Release Notes *</Label>
                    <Textarea id="releaseNotes" required placeholder="What's new in this version..." rows={4} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="icon">App Icon *</Label>
                      <Input id="icon" type="file" required accept="image/*" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="screenshots">Screenshots *</Label>
                      <Input id="screenshots" type="file" required accept="image/*" multiple />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appFile">App File (APK/ZIP) *</Label>
                    <Input id="appFile" type="file" required accept=".apk,.zip" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minOS">Minimum OS *</Label>
                      <Input id="minOS" required placeholder="Android 8.0+" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">File Size</Label>
                      <Input id="size" placeholder="Calculated automatically" disabled />
                    </div>
                  </div>

                  <Button type="submit" size="lg" disabled={uploading} className="w-full">
                    {uploading ? (
                      "Uploading..."
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
            <Card>
              <CardHeader>
                <CardTitle>Manage Apps</CardTitle>
                <CardDescription>View and edit your published apps</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">App management interface will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Respond to user support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Support ticket management will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
