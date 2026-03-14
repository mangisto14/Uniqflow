import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId?: string;
  team?: { name: string };
  createdAt: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    (apiClient.get('/users?page=1&limit=100') as Promise<{ data: { data: { users: User[] } } }>)
      .then((r) => {
        const d = r.data?.data ?? r.data;
        setUsers((d as { users: User[] }).users ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const roleColor: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700',
    ADMIN: 'bg-orange-100 text-orange-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    EDITOR: 'bg-green-100 text-green-700',
    VIEWER: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      {loading ? (
        <div className="flex justify-center h-32 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Team</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role] ?? 'bg-gray-100'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.team?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
