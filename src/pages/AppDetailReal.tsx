import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Download, Star, Share2, MessageCircle, Info, Calendar, HardDrive, Monitor, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AppDetailReal = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [app, setApp] = useState<any>(null);
  const [version, setVersion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAppDetails();
    }
  }, [id]);

  const fetchAppDetails = async () => {
    try {
      const { data: appData, error: appError } = await supabase
        .from("apps")
        .select("*")
        .eq("id", id)
        .eq("deleted", false)
        .single();

      if (appError) throw appError;

      const { data: versionData, error: versionError } = await supabase
        .from("app_versions")
        .select("*")
        .eq("app_id", id)
        .order("uploaded_at", { ascending: false })
        .limit(1)
        .single();

      if (versionError) throw versionError;

      setApp(appData);
      setVersion(versionData);
    } catch (error: any) {
      toast({
        title: "Error loading app",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!app || !version) return;

    setDownloading(true);
    try {
      // Call edge function to log download and get file URL
      const { data, error } = await supabase.functions.invoke("download-app", {
        body: { appId: app.id, version: version.version },
      });

      if (error) throw error;

      // Increment download count
      await supabase.rpc("increment_download_count", { app_id_param: app.id });

      // Open download URL in new tab
      window.open(version.file_url, "_blank");

      toast({
        title: "Download started",
        description: `${app.title} is being downloaded.`,
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-4">App Not Found</h2>
              <p className="text-muted-foreground mb-6">The app you're looking for doesn't exist or has been removed.</p>
              <Link to="/browse">
                <Button>Browse Apps</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* App Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <img
            src={app.icon_url || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&h=200&fit=crop"}
            alt={app.title}
            className="w-32 h-32 rounded-2xl shadow-lg object-cover"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className="mb-2 capitalize">{app.category}</Badge>
                <h1 className="text-4xl font-bold mb-2">{app.title}</h1>
                <p className="text-lg text-muted-foreground">{app.short_description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm mb-6">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold">{app.rating || "4.5"}</span>
              </div>
              <div className="text-muted-foreground">{(app.download_count || 0).toLocaleString()} downloads</div>
              <div className="text-muted-foreground">{app.min_os}</div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={handleDownload} disabled={downloading || !version}>
                {downloading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="mr-2 h-5 w-5" />
                Share
              </Button>
              <Link to="/support">
                <Button variant="outline" size="lg">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Get Support
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Screenshots */}
        {app.screenshots && app.screenshots.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Screenshots</CardTitle>
            </CardHeader>
            <CardContent>
              <Carousel className="w-full">
                <CarouselContent>
                  {app.screenshots.map((screenshot: string, index: number) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                      <img
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="rounded-lg w-full h-auto"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About this app</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">{app.long_description}</p>
          </CardContent>
        </Card>

        {/* Release Notes */}
        {version?.release_notes && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What's New</CardTitle>
              <CardDescription>Version {version.version}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">{version.release_notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Version</p>
                  <p className="text-muted-foreground">{app.current_version}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Updated</p>
                  <p className="text-muted-foreground">
                    {new Date(app.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <HardDrive className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Size</p>
                  <p className="text-muted-foreground">{app.file_size || "Unknown"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Minimum OS</p>
                  <p className="text-muted-foreground">{app.min_os}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppDetailReal;
