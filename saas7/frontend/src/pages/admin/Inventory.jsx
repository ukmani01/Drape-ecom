import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventory, updateInventory } from '../../api/inventory';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const AdminInventory = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-inventory'],
        queryFn: () => getInventory().then(res => res.data.data),
    });
    const queryClient = useQueryClient();
    const [stockUpdates, setStockUpdates] = useState({});

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateInventory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-inventory']);
            toast.success('Stock updated');
        },
    });

    const handleStockChange = (id, value) => {
        setStockUpdates({ ...stockUpdates, [id]: value });
    };

    const handleUpdate = (id) => {
        const stock = parseInt(stockUpdates[id]);
        if (isNaN(stock)) return toast.error('Enter valid number');
        updateMutation.mutate({ id, data: { stock } });
    };

    if (isLoading) return <div>Loading...</div>;

    const products = data?.docs || [];

    return (
        <div>
            <h1 className="text-2xl font-display font-bold mb-6">Inventory</h1>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3">Product</th>
                                <th>SKU</th>
                                <th>Current Stock</th>
                                <th>Update Stock</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => {
                                const variant = product.variants?.[0];
                                const currentStock = variant?.stock || 0;
                                return (
                                    <tr key={product._id} className="border-b hover:bg-secondary-50">
                                        <td className="p-3">{product.title}</td>
                                        <td>{variant?.sku || 'N/A'}</td>
                                        <td>{currentStock}</td>
                                        <td>
                                            <Input
                                                type="number"
                                                value={stockUpdates[product._id] ?? currentStock}
                                                onChange={(e) => handleStockChange(product._id, e.target.value)}
                                                className="w-24"
                                            />
                                        </td>
                                        <td>
                                            <Button variant="primary" size="sm" onClick={() => handleUpdate(product._id)} loading={updateMutation.isLoading}>
                                                Update
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminInventory;