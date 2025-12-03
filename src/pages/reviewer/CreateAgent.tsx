import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateAgent() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create AI Agent</h1>
          <p className="text-muted-foreground">
            Configure a new AI review agent
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Agent creation form - Coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
