import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Authentication Error
          </h1>

          <p className="text-muted-foreground">
            We encountered an issue while trying to authenticate you. This might
            happen if:
          </p>

          <ul className="text-sm text-muted-foreground text-left list-disc pl-6 space-y-2">
            <li>The authentication link has expired</li>
            <li>The link has already been used</li>
            <li>The link is invalid or malformed</li>
          </ul>

          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href="/sign-in">Return to Sign In</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
