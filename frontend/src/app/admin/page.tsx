import Head from 'next/head';

export default function AdminDashboard() {
  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
        <meta name="description" content="Library Reservation System Admin Dashboard" />
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        {/* Add admin dashboard content here */}
      </div>
    </>
  );
}
  title: 'Admin Dashboard',
  description: 'Library Reservation System Admin Dashboard',
};

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {/* Add admin dashboard content here */}
    </div>
  );
}
