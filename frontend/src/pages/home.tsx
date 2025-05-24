import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, Search, Users, BookMarked, LibraryBig } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Welcome to the <span className="text-primary">Library</span> Reservation System
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Reserve books, study rooms, and manage your library account all in one place. 
              Start exploring our vast collection of resources today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button asChild size="lg">
                    <Link to="/books">Browse Books</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/reservations">My Reservations</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link to="/register">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need in one place
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our library offers a wide range of services to support your learning and research needs.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Book Lending */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Book Lending</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Borrow from our extensive collection of books, e-books, and academic resources.
              </p>
            </div>

            {/* Study Rooms */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Study Rooms</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Reserve quiet study spaces for individual or group work with modern facilities.
              </p>
            </div>

            {/* Online Resources */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Online Resources</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Access digital journals, databases, and e-books from anywhere, anytime.
              </p>
            </div>

            {/* Reservation System */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Easy Reservations</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Book resources and rooms in advance with our simple online reservation system.
              </p>
            </div>

            {/* Extended Hours */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Extended Hours</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Enjoy extended opening hours during exam periods and special study sessions.
              </p>
            </div>

            {/* Research Support */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <BookMarked className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Research Support</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get assistance from our expert librarians for your research projects and papers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <LibraryBig className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Join thousands of students and researchers who are already using our library services.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button asChild size="lg" className="px-8">
                  <Link to="/books">Browse Collection</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="px-8">
                  <Link to="/register">Create Account</Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
