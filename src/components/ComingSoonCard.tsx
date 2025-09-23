import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ComingSoonCardProps {
  title: string;
  description?: string;
}

const ComingSoonCard = ({ title, description }: ComingSoonCardProps) => {
  return (
    <Card className="h-full flex flex-col items-center justify-center p-8 text-center border-dashed border-2 border-muted-foreground/20">
      <CardHeader className="pb-4">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <Badge variant="secondary" className="mx-auto">
          Próximamente
        </Badge>
      </CardHeader>
      
      <CardContent className="pt-0">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ComingSoonCard;