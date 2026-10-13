import { Link } from "wouter";
import { usePageTitle } from "@/hooks/use-page-title";
import { Layout } from "@/components/ui/Layout";
import { PageTitle } from "@/components/PageTitle";

export default function NotFound() {
  usePageTitle("Page Not Found");
  return (
    <Layout>
      <div className="space-y-6">
        <PageTitle>404 Page Not Found</PageTitle>
        <p className="text-muted-foreground font-serif text-lg">
          The page you seek has been lost to the void. Perhaps the Demon has hidden it?
        </p>
        <Link href="/" className="btn-primary" data-testid="link-return-home">
          Return to Safety
        </Link>
      </div>
    </Layout>
  );
}
