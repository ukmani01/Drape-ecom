import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../api/notifications';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-notifications'],
        queryFn: () => getNotifications().then(res => res.data.data),
    });
    const queryClient = useQueryClient();

    const markReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-notifications']);
            toast.success('Marked as read');
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-notifications']);
            toast.success('All marked as read');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-notifications']);
            toast.success('Notification deleted');
        },
    });

    if (isLoading) return <div>Loading...</div>;

    const notifications = data?.docs || [];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-display font-bold">Notifications</h1>
                <Button variant="outline" onClick={() => markAllReadMutation.mutate()}>Mark All Read</Button>
            </div>
            <Card>
                {notifications.length === 0 ? (
                    <p className="text-secondary-500 p-4">No notifications</p>
                ) : (
                    <div className="divide-y divide-secondary-100">
                        {notifications.map(notif => (
                            <div key={notif._id} className={`py-4 px-2 ${!notif.isRead ? 'bg-secondary-50' : ''}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{notif.title}</p>
                                        <p className="text-sm text-secondary-500">{notif.message}</p>
                                        <p className="text-xs text-secondary-400">{new Date(notif.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {!notif.isRead && (
                                            <Button variant="outline" size="sm" onClick={() => markReadMutation.mutate(notif._id)}>Mark Read</Button>
                                        )}
                                        <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate(notif._id)}>Delete</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminNotifications;