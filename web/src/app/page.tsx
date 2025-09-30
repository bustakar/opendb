import { NavBar } from '@/components/layout/nav-bar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <NavBar />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            OpenDB Calisthenics
          </h1>
          <p className="text-xl text-muted-foreground">
            A community-driven database of calisthenics skills and training
            places. Browse, contribute, and help grow the calisthenics
            community.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/skills">Browse Skills</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/places">Find Places</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
