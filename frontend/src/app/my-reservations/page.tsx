import Head from 'next/head';

export default function MyReservationsPage() {
  return (
    <>
      <Head>
        <title>My Reservations</title>
        <meta name="description" content="View and manage your library reservations" />
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">My Reservations</h1>
        {/* Add my reservations content here */}
      </div>
    </>
  );
}
