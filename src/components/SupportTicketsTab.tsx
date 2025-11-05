import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  app_id: string | null;
  apps?: {
    title: string;
  };
}

interface TicketReply {
  id: string;
  message: string;
  created_at: string;
  replied_by: string | null;
}

const SupportTicketsTab = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchReplies(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select(`
          *,
          apps (
            title
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive",
      });
    }
  };

  const fetchReplies = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error: any) {
      console.error("Error fetching replies:", error);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: "new" | "open" | "resolved") => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (error) throw error;

      // Send status update email notification
      const ticketToUpdate = selectedTicket?.id === ticketId ? selectedTicket : tickets.find(t => t.id === ticketId);
      if (ticketToUpdate) {
        const { error: emailError } = await supabase.functions.invoke("send-ticket-email", {
          body: {
            to: ticketToUpdate.email,
            subject: ticketToUpdate.subject,
            ticketId: ticketToUpdate.id,
            customerName: ticketToUpdate.name,
            message: ticketToUpdate.message,
            isStatusUpdate: true,
            newStatus: newStatus,
          },
        });

        if (emailError) {
          console.error("Email notification error:", emailError);
        }
      }

      toast({
        title: "Status updated",
        description: `Ticket status changed to ${newStatus} and customer notified`,
      });

      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Add reply to database
      const { error: replyError } = await supabase
        .from("ticket_replies")
        .insert([{
          ticket_id: selectedTicket.id,
          message: replyMessage,
          replied_by: user?.id,
        }]);

      if (replyError) throw replyError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke("send-ticket-email", {
        body: {
          to: selectedTicket.email,
          subject: selectedTicket.subject,
          ticketId: selectedTicket.id,
          customerName: selectedTicket.name,
          message: selectedTicket.message,
          isReply: true,
          replyMessage: replyMessage,
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        toast({
          title: "Reply sent",
          description: "Reply saved but email notification failed",
          variant: "default",
        });
      } else {
        toast({
          title: "Reply sent",
          description: "Email notification sent to customer",
        });
      }

      // Update ticket status to open if it was new
      if (selectedTicket.status === "new") {
        await handleStatusChange(selectedTicket.id, "open");
      }

      setReplyMessage("");
      fetchReplies(selectedTicket.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: { variant: "default" as const, icon: Clock, color: "text-blue-500" },
      open: { variant: "secondary" as const, icon: MessageSquare, color: "text-yellow-500" },
      resolved: { variant: "outline" as const, icon: CheckCircle, color: "text-green-500" },
    };

    const style = styles[status as keyof typeof styles] || styles.new;
    const Icon = style.icon;

    return (
      <Badge variant={style.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${style.color}`} />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Tickets List */}
      <div className="md:col-span-1 space-y-4">
        <h3 className="font-semibold text-lg">All Tickets ({tickets.length})</h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTicket?.id === ticket.id ? "border-primary" : ""
              }`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{ticket.subject}</p>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">From: {ticket.name}</p>
                  {ticket.apps && (
                    <p className="text-xs text-muted-foreground">App: {ticket.apps.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Ticket Details */}
      <div className="md:col-span-2">
        {selectedTicket ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedTicket.subject}</CardTitle>
                  <CardDescription>
                    Ticket #{selectedTicket.id.slice(0, 8)} • {new Date(selectedTicket.created_at).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => handleStatusChange(selectedTicket.id, value as "new" | "open" | "resolved")}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Details */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p className="text-sm"><strong>Name:</strong> {selectedTicket.name}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedTicket.email}</p>
                  {selectedTicket.apps && (
                    <p className="text-sm"><strong>Related App:</strong> {selectedTicket.apps.title}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Original Message */}
              <div className="space-y-2">
                <h4 className="font-semibold">Customer Query</h4>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              {/* Replies */}
              {replies.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-semibold">Conversation History</h4>
                    {replies.map((reply) => (
                      <div key={reply.id} className="bg-green-50 dark:bg-green-950 p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium">Admin</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(reply.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator />

              {/* Reply Form */}
              <div className="space-y-4">
                <h4 className="font-semibold">Send Reply</h4>
                <Textarea
                  placeholder="Type your reply here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={handleReply}
                  disabled={loading || !replyMessage.trim()}
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {loading ? "Sending..." : "Send Reply & Email Customer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Select a ticket to view details and respond</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsTab;
