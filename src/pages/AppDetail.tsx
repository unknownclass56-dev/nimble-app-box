import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Download, Star, Share2, Shield, Smartphone, LifeBuoy } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const AppDetail = () => {
  const { id } = useParams();

  // Mock app data
  const app = {
    id: id || "1",
    title: "Photo Editor Pro",
    category: "Photography",
    shortDescription: "Professional photo editing tools with AI enhancement",
    longDescription: "Transform your photos with our advanced AI-powered editing suite. Features include one-click enhancement, professional filters, advanced color correction, and intelligent object removal. Perfect for both beginners and professional photographers.",
    iconUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&h=200&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
    ],
    downloadCount: 125000,
    rating: 4.8,
    version: "2.5.1",
    minOS: "Android 8.0+",
    size: "45 MB",
    releaseNotes: "- Added new AI filters\n- Improved performance\n- Bug fixes and stability improvements",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <img
            src={app.iconUrl}
            alt={app.title}
            className="w-32 h-32 rounded-2xl object-cover shadow-lg"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{app.title}</h1>
                <Badge variant="secondary" className="mb-2">{app.category}</Badge>
                <p className="text-lg text-muted-foreground">{app.shortDescription}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-lg font-semibold">{app.rating}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-muted-foreground" />
                <span>{app.downloadCount.toLocaleString()} downloads</span>
              </div>
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <span>{app.minOS}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="group">
                <Download className="mr-2 h-5 w-5" />
                Download ({app.size})
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="mr-2 h-5 w-5" />
                Share
              </Button>
              <Link to="/support">
                <Button size="lg" variant="outline">
                  <LifeBuoy className="mr-2 h-5 w-5" />
                  Get Support
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Screenshots Carousel */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Screenshots</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {app.screenshots.map((screenshot, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <img
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </Card>

        {/* Description */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">About this app</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {app.longDescription}
          </p>
        </Card>

        {/* What's New */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">What's New</h2>
          <p className="text-sm text-muted-foreground mb-2">Version {app.version}</p>
          <p className="text-muted-foreground whitespace-pre-line">{app.releaseNotes}</p>
        </Card>

        {/* Additional Info */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Size</p>
              <p className="font-medium">{app.size}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Version</p>
              <p className="font-medium">{app.version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Minimum OS</p>
              <p className="font-medium">{app.minOS}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Category</p>
              <p className="font-medium">{app.category}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AppDetail;
