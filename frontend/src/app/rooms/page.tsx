import Head from 'next/head';

export default function RoomsPage() {
  return (
    <>
      <Head>
        <title>Rooms</title>
        <meta name="description" content="View and manage library rooms" />
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Rooms</h1>
        {/* Add rooms content here */}
      </div>
    </>
  );
}
