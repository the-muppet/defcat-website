/**
 * Page for Database management
 */
import { requireAdmin } from '@/lib/auth-guards';
import { createClient } from '@/lib/supabase/server';

export default async function SyncLogsPage() {
  await requireAdmin();

  const supabase = await createClient();
  
  const { data: syncs } = await supabase
    .from('recent_syncs')
    .select('*')
    .limit(20);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Sync Logs</h1>
      <div className="space-y-4">
        {syncs?.map((sync) => (
          <div key={sync.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  sync.status === 'completed' ? 'bg-green-100 text-green-800' :
                  sync.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {sync.status}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(sync.started_at || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {(sync.duration_ms || 0 / 1000).toFixed(1)}s
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total</div>
                <div className="font-semibold">{sync.total_decks}</div>
              </div>
              <div>
                <div className="text-gray-500">Updated</div>
                <div className="font-semibold text-green-600">{sync.updated_decks}</div>
              </div>
              <div>
                <div className="text-gray-500">Unchanged</div>
                <div className="font-semibold text-gray-600">{sync.unchanged_decks}</div>
              </div>
              <div>
                <div className="text-gray-500">Failed</div>
                <div className="font-semibold text-red-600">{sync.failed_decks}</div>
              </div>
            </div>

            {sync.success_rate && (
              <div className="mt-2">
                <div className="text-sm text-gray-500 mb-1">Success Rate</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${sync.success_rate}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}