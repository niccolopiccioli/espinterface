import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold" style={{ color: 'var(--hw-danger)' }}>404</h2>
        <p className="text-xl text-foreground">Page Not Found</p>
        <p className="text-muted-foreground">
          The requested hardware page does not exist.
        </p>
        <Link href="/">
          <Button className="gap-2 mt-4">
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
