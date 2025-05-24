"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PerformanceAnalysisPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);

  // Mock performance data
  const mockPerformanceData = {
    lighthouse: {
      beforeOptimization: {
        performance: 72,
        accessibility: 88,
        bestPractices: 85,
        seo: 90,
        pwa: 60
      },
      afterOptimization: {
        performance: 96,
        accessibility: 98,
        bestPractices: 95,
        seo: 98,
        pwa: 75
      }
    },
    apiPerformance: {
      endpoints: [
        { name: '/api/rooms', p50: 120, p95: 350, p99: 480 },
        { name: '/api/seats', p50: 110, p95: 320, p99: 450 },
        { name: '/api/books', p50: 150, p95: 380, p99: 520 },
        { name: '/api/reservations', p50: 180, p95: 420, p99: 580 },
        { name: '/api/loans', p50: 160, p95: 390, p99: 540 }
      ],
      optimizedEndpoints: [
        { name: '/api/rooms', p50: 60, p95: 150, p99: 220 },
        { name: '/api/seats', p50: 55, p95: 140, p99: 210 },
        { name: '/api/books', p50: 70, p95: 160, p99: 240 },
        { name: '/api/reservations', p50: 80, p95: 180, p99: 260 },
        { name: '/api/loans', p50: 75, p95: 170, p99: 250 }
      ]
    },
    optimizations: [
      {
        category: 'Frontend',
        items: [
          { name: 'Image optimization', status: 'Complete', impact: 'High' },
          { name: 'Code splitting', status: 'Complete', impact: 'High' },
          { name: 'Tree shaking', status: 'Complete', impact: 'Medium' },
          { name: 'Lazy loading', status: 'Complete', impact: 'High' },
          { name: 'Minification', status: 'Complete', impact: 'Medium' },
          { name: 'Compression', status: 'Complete', impact: 'Medium' },
          { name: 'Font optimization', status: 'Complete', impact: 'Low' }
        ]
      },
      {
        category: 'Backend',
        items: [
          { name: 'Database indexing', status: 'Complete', impact: 'High' },
          { name: 'Query optimization', status: 'Complete', impact: 'High' },
          { name: 'Response caching', status: 'Complete', impact: 'High' },
          { name: 'Connection pooling', status: 'Complete', impact: 'Medium' },
          { name: 'Pagination implementation', status: 'Complete', impact: 'Medium' },
          { name: 'API rate limiting', status: 'Complete', impact: 'Low' }
        ]
      }
    ]
  };

  useEffect(() => {
    // Simulate loading performance data
    const loadPerformanceData = async () => {
      try {
        // In a real app, this would fetch actual performance data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPerformanceData(mockPerformanceData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading performance data:', error);
        setLoading(false);
      }
    };
    
    loadPerformanceData();
  }, []);

  const runOptimizations = async () => {
    setOptimizing(true);
    
    try {
      // Simulate running optimizations
      await new Promise(resolve => setTimeout(resolve, 3000));
      setOptimizationComplete(true);
      setOptimizing(false);
    } catch (error) {
      console.error('Error running optimizations:', error);
      setOptimizing(false);
    }
  };

  // Format Lighthouse data for chart
  const formatLighthouseData = () => {
    if (!performanceData) return [];
    
    const { beforeOptimization, afterOptimization } = performanceData.lighthouse;
    
    return [
      {
        name: 'Performance',
        before: beforeOptimization.performance,
        after: optimizationComplete ? afterOptimization.performance : beforeOptimization.performance,
      },
      {
        name: 'Accessibility',
        before: beforeOptimization.accessibility,
        after: optimizationComplete ? afterOptimization.accessibility : beforeOptimization.accessibility,
      },
      {
        name: 'Best Practices',
        before: beforeOptimization.bestPractices,
        after: optimizationComplete ? afterOptimization.bestPractices : beforeOptimization.bestPractices,
      },
      {
        name: 'SEO',
        before: beforeOptimization.seo,
        after: optimizationComplete ? afterOptimization.seo : beforeOptimization.seo,
      },
      {
        name: 'PWA',
        before: beforeOptimization.pwa,
        after: optimizationComplete ? afterOptimization.pwa : beforeOptimization.pwa,
      },
    ];
  };

  // Format API performance data for chart
  const formatApiPerformanceData = () => {
    if (!performanceData) return [];
    
    const { endpoints, optimizedEndpoints } = performanceData.apiPerformance;
    
    return endpoints.map((endpoint, index) => ({
      name: endpoint.name,
      'P95 Before': endpoint.p95,
      'P95 After': optimizationComplete ? optimizedEndpoints[index].p95 : endpoint.p95,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Performance Analysis</h1>
            <button
              onClick={() => router.push('/admin')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Lighthouse Scores */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Lighthouse Scores</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Performance metrics from Lighthouse audits before and after optimization.
                </p>
              </div>
              
              <div className="px-6 py-5">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formatLighthouseData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value}/100`} />
                      <Legend />
                      <Bar dataKey="before" name="Before Optimization" fill="#8884d8" />
                      <Bar dataKey="after" name="After Optimization" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* API Performance */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">API Performance (P95 Response Time)</h2>
                <p className="mt-1 text-sm text-gray-500">
                  95th percentile response times in milliseconds for key API endpoints.
                </p>
              </div>
              
              <div className="px-6 py-5">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formatApiPerformanceData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" unit="ms" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip formatter={(value) => `${value} ms`} />
                      <Legend />
                      <Bar dataKey="P95 Before" name="Before Optimization" fill="#8884d8" />
                      <Bar dataKey="P95 After" name="After Optimization" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600">
                    <span className="mr-2">✓</span>
                    All API endpoints now meet P95 &lt; 300ms target
                  </div>
                </div>
              </div>
            </div>
            
            {/* Optimizations Applied */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Optimizations Applied</h2>
                <p className="mt-1 text-sm text-gray-500">
                  List of performance optimizations applied to the application.
                </p>
              </div>
              
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {performanceData.optimizations.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-md font-medium mb-4">{category.category} Optimizations</h3>
                      <ul className="divide-y divide-gray-200">
                        {category.items.map((item) => (
                          <li key={item.name} className="py-3 flex justify-between">
                            <div>
                              <span className="text-sm font-medium text-gray-900">{item.name}</span>
                              <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.impact === 'High' 
                                  ? 'bg-red-100 text-red-800' 
                                  : item.impact === 'Medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                              }`}>
                                {item.impact} Impact
                              </span>
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              optimizationComplete || item.status === 'Complete'
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {optimizationComplete ? 'Complete' : item.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={runOptimizations}
                    disabled={optimizing || optimizationComplete}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      (optimizing || optimizationComplete) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {optimizing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Running Optimizations...
                      </>
                    ) : optimizationComplete ? (
                      'All Optimizations Complete'
                    ) : (
                      'Run All Optimizations'
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Performance Recommendations */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Ongoing Performance Recommendations</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Recommendations for maintaining optimal performance in production.
                </p>
              </div>
              
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium mb-2">Frontend</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Regularly audit with Lighthouse and WebPageTest</li>
                      <li>Monitor Core Web Vitals in Google Search Console</li>
                      <li>Use performance budgets to prevent regression</li>
                      <li>Implement real user monitoring (RUM)</li>
                      <li>Optimize images and use WebP format</li>
                      <li>Implement service worker for offline support</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium mb-2">Backend</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>Monitor API response times with Prometheus</li>
                      <li>Set up alerts for performance degradation</li>
                      <li>Regularly review and optimize database queries</li>
                      <li>Implement horizontal scaling for API pods</li>
                      <li>Use read replicas for database scaling</li>
                      <li>Implement proper caching strategies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
