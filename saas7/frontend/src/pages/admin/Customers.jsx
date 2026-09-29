import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers, searchCustomers } from '../../api/customers';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useDebounce } from '../../hooks/useDebounce';

const AdminCustomers = () => {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-customers', debouncedSearch, page],
        queryFn: () => {
            if (debouncedSearch) {
                return searchCustomers(debouncedSearch).then(res => res.data.data);
            }
            return getCustomers({ page, limit: 20 }).then(res => res.data.data);
        },
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-display font-bold mb-6">Customers</h1>
            <div className="mb-4 flex gap-4">
                <Input
                    label="Search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, phone"
                    className="max-w-sm"
                />
                <Button variant="outline" onClick={() => setSearch('')}>Clear</Button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3">Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Orders</th>
                                <th>Lifetime Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.docs.map(customer => (
                                <tr key={customer._id} className="border-b hover:bg-secondary-50">
                                    <td className="p-3">{customer.firstName} {customer.lastName}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.totalOrders}</td>
                                    <td>₹{customer.lifetimeValue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminCustomers;