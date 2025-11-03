import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LifeBuoy, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Support = () => {
  const { toast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    appId: "",
    message: "",
  });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const { data, error } = await supabase
        .from("apps")
        .select("id, title")
        .eq("deleted", false)
        .order("title", { ascending: true });

      if (error) throw error;
      setApps(data || []);
    } catch (error) {
      console.error("Error fetching apps:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from("support_tickets").insert([{
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        app_id: formData.appId && formData.appId !== "none" ? formData.appId : null,
        message: formData.message,
      }]);

      if (error) throw error;

      toast({
        title: "Support ticket submitted",
        description: "We'll get back to you within 24 hours.",
      });
      
      setFormData({
        name: "",
        email: "",
        subject: "",
        appId: "",
        message: "",
      });
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <LifeBuoy className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Get Support</h1>
            <p className="text-lg text-muted-foreground">
              Have a question or need help? We're here for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <Mail className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Email Support</h3>
              <p className="text-muted-foreground text-sm">
                We typically respond within 24 hours
              </p>
            </Card>
            <Card className="p-6">
              <MessageSquare className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Submit a Ticket</h3>
              <p className="text-muted-foreground text-sm">
                Track your issue from start to finish
              </p>
            </Card>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appId">Related App (Optional)</Label>
                <Select value={formData.appId} onValueChange={(value) => setFormData({ ...formData, appId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an app if applicable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific app</SelectItem>
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your issue in detail..."
                  rows={6}
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Submit Support Ticket
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;
