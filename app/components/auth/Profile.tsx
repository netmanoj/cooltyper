import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TypingHistory {
  id: number;
  user_id: string;
  wpm: number;
  accuracy: number;
  mode: string;
  duration: number;
  created_at: string;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const [history, setHistory] = useState<TypingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data, error } = await supabase
          .from('typing_history')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        setError('Failed to load typing history');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      setError('Failed to sign out');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Profile</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Typing Tests</h3>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {loading ? (
          <p>Loading history...</p>
        ) : (
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-500">No typing tests completed yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((test) => (
                  <div
                    key={test.id}
                    className="border rounded-lg p-4 hover:border-yellow-500 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-2xl font-bold text-yellow-500">
                        {test.wpm} WPM
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(test.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Accuracy:</span>
                        <span className="ml-2 font-medium">{test.accuracy}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-medium">{test.duration}s</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Mode:</span>
                        <span className="ml-2 font-medium">{test.mode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 