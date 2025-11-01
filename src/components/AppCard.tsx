import { Download, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface AppCardProps {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  iconUrl: string;
  downloadCount: number;
  rating?: number;
}

const AppCard = ({
  id,
  title,
  category,
  shortDescription,
  iconUrl,
  downloadCount,
  rating = 4.5,
}: AppCardProps) => {
  return (
    <Link to={`/app/${id}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <img
                src={iconUrl}
                alt={title}
                className="h-16 w-16 rounded-xl object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {title}
              </h3>
              <Badge variant="secondary" className="mt-1">
                {category}
              </Badge>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {shortDescription}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="h-4 w-4" />
            <span>{downloadCount.toLocaleString()}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default AppCard;
