import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActivityLogs } from '../../api/activity';
import Card from '../../components/ui/Card';

const AdminActivity = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-activity', page],
    queryFn: () => getActivityLogs({ page, limit: 20 }).then(res => res.data.data),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Activity Logs</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">User</th>
                <th>Action</th>
                <th>Details</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {data?.docs.map(log => (
                <tr key={log._id} className="border-b hover:bg-secondary-50">
                  <td className="p-3">{log.userEmail || 'System'}</td>
                  <td>{log.action}</td>
                  <td>{log.details ? JSON.stringify(log.details) : ''}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminActivity;