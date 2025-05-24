import Head from 'next/head';

export default function BooksPage() {
  return (
    <>
      <Head>
        <title>Books</title>
        <meta name="description" content="View and manage library books" />
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Books</h1>
        {/* Add books content here */}
      </div>
    </>
  );
}
