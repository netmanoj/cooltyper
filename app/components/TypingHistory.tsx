import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface TestResult {
  id: string;
  created_at: string;
  user_id: string;
  wpm: number;
  accuracy: number;
  errors: number;
  characters: number;
  duration: number;
  mode: string;
}

export default function TypingHistory() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchHistory() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching history for user:', {
          userId: user.id,
          userEmail: user.email,
          timestamp: new Date().toISOString()
        });

        const { data, error } = await supabase
          .from('typing_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching results:', error);
          setError(error.message);
          throw error;
        }
        
        console.log('Fetched typing results:', {
          count: data?.length || 0,
          firstResult: data?.[0],
          lastResult: data?.[data.length - 1]
        });
        
        // Format the data
        const formattedData = data?.map(result => ({
          ...result,
          wpm: Math.round(result.wpm),
          accuracy: Math.round(result.accuracy),
          duration: result.duration || 0
        })) || [];
        
        setResults(formattedData);
        setError(null);
      } catch (error) {
        console.error('Error fetching typing history:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();

    // Set up real-time subscription for new results
    const channel = supabase
      .channel('typing_results_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'typing_results',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('New result received:', payload);
          setResults(current => [payload.new as TestResult, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400 mb-4">Please sign in to view your typing history</p>
        <button
          onClick={() => router.push('/auth')}
          className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-4 text-gray-400">Loading history...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-400">
        Error: {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (results.length === 0) {
    return <div className="text-center py-4 text-gray-400">No typing tests completed yet.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-200">Typing History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#262626] border border-gray-700 rounded-lg">
          <thead>
            <tr className="bg-[#303030]">
              <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                WPM
              </th>
              <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Accuracy
              </th>
              <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Mode
              </th>
              <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Characters
              </th>
              <th className="px-6 py-3 border-b border-gray-700 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Errors
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {results.map((result) => (
              <tr key={result.id} className="hover:bg-[#303030] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {new Date(result.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-500">
                  {result.wpm}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {result.accuracy}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {result.mode || 'time'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {result.duration}s
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {result.characters}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {result.errors}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 