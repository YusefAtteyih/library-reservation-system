import Head from 'next/head';

export default function ApprovalsPage() {
  return (
    <>
      <Head>
        <title>Approval Requests</title>
        <meta name="description" content="Manage approval requests for the Library Reservation System" />
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Approval Requests</h1>
        {/* Add approvals content here */}
      </div>
    </>
  );
}
