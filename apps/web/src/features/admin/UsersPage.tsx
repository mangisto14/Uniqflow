import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { t } from '../../i18n';

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

  useEffect(() => {
    (apiClient.get('/users?page=1&limit=100') as Promise<{ data: { data: { users: User[] } } }>)
      .then((r) => {
        const d = r.data?.data ?? r.data;
        setUsers((d as { users: User[] }).users ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roleColor: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700',
    ADMIN: 'bg-orange-100 text-orange-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    EDITOR: 'bg-green-100 text-green-700',
    VIEWER: 'bg-gray-100 text-gray-600',
  };

  const roleHe: Record<string, string> = {
    SUPER_ADMIN: 'מנהל על',
    ADMIN: 'מנהל',
    MANAGER: 'מנהל תהליך',
    EDITOR: 'עורך',
    VIEWER: 'צופה',
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900">{t.users.title}</h1>
      {loading ? (
        <div className="flex justify-center h-32 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">{t.users.nameCol}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">{t.users.emailCol}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">{t.users.roleCol}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">{t.users.teamCol}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">{t.users.joinedCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role] ?? 'bg-gray-100'}`}>
                      {roleHe[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.team?.name ?? t.users.noTeam}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString('he-IL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
