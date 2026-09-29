import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviews, approveReview, rejectReview } from '../../api/reviews';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const AdminReviews = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-reviews'],
        queryFn: () => getReviews().then(res => res.data.data),
    });
    const queryClient = useQueryClient();

    const approveMutation = useMutation({
        mutationFn: approveReview,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-reviews']);
            toast.success('Review approved');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: rejectReview,
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-reviews']);
            toast.success('Review rejected');
        },
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-display font-bold mb-6">Reviews</h1>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3">Product</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.docs.map(review => (
                                <tr key={review._id} className="border-b hover:bg-secondary-50">
                                    <td className="p-3">{review.productId?.title || 'N/A'}</td>
                                    <td>{review.rating}</td>
                                    <td>{review.comment}</td>
                                    <td><span className={`badge ${review.status === 'approved' ? 'badge-success' : review.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>{review.status}</span></td>
                                    <td>
                                        {review.status === 'pending' && (
                                            <>
                                                <Button variant="primary" size="sm" onClick={() => approveMutation.mutate(review._id)}>Approve</Button>
                                                <Button variant="danger" size="sm" onClick={() => rejectMutation.mutate(review._id)}>Reject</Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminReviews;