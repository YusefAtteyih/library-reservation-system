import Head from 'next/head';

export default function SeatsPage() {
  return (
    <>
      <Head>
        <title>Seats</title>
        <meta name="description" content="View and manage library seats" />
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Seats</h1>
        {/* Add seats content here */}
      </div>
    </>
  );
}
