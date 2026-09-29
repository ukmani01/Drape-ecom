import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateCustomer } from '../api/customers';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiCheck } from 'react-icons/fi';

const Profile = () => {
    const { user, customer, updateUser, updateCustomer: updateCustomerContext } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showAddAddress, setShowAddAddress] = useState(false);

    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const [addressForm, setAddressForm] = useState({
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        phone: '',
        isDefault: false,
    });

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleAddressChange = (e) => setAddressForm({ ...addressForm, [e.target.name]: e.target.value });

    // ✅ Update Profile
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            updateUser({ ...user, name: form.name, phone: form.phone });
            toast.success('Profile updated successfully ✅');
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Add/Update Address
    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        if (!customer) {
            toast.error('No customer profile found');
            return;
        }

        // ✅ Validate required fields
        if (!addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode || !addressForm.phone) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            console.log('📤 Sending address:', addressForm);

            let addresses = customer.addresses || [];

            if (editingAddress) {
                addresses = addresses.map(addr =>
                    addr._id === editingAddress._id ? { ...addressForm, _id: addr._id } : addr
                );
            } else {
                addresses.push({ ...addressForm });
            }

            const response = await updateCustomer(customer._id, { addresses });
            console.log('✅ Address saved:', response.data);

            // ✅ Update customer in context
            updateCustomerContext(response.data.data);

            toast.success(editingAddress ? 'Address updated successfully ✅' : 'Address added successfully ✅');
            setShowAddAddress(false);
            setEditingAddress(null);
            setAddressForm({ line1: '', line2: '', city: '', state: '', pincode: '', country: 'India', phone: '', isDefault: false });
        } catch (err) {
            console.error('❌ Save failed:', err);
            toast.error(err.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Delete Address
    const handleDeleteAddress = async (addressId) => {
        if (!customer) return;
        if (!window.confirm('Delete this address?')) return;

        try {
            const addresses = customer.addresses.filter(addr => addr._id !== addressId);
            const response = await updateCustomer(customer._id, { addresses });
            updateCustomerContext(response.data.data);
            toast.success('Address deleted ✅');
        } catch (err) {
            toast.error('Failed to delete address');
        }
    };

    // ✅ Edit Address
    const handleEditAddress = (address) => {
        setEditingAddress(address);
        setAddressForm({
            line1: address.line1 || '',
            line2: address.line2 || '',
            city: address.city || '',
            state: address.state || '',
            pincode: address.pincode || '',
            country: address.country || 'India',
            phone: address.phone || '',
            isDefault: address.isDefault || false,
        });
        setShowAddAddress(true);
    };

    // ✅ Cancel Address Form
    const handleCancelAddress = () => {
        setShowAddAddress(false);
        setEditingAddress(null);
        setAddressForm({ line1: '', line2: '', city: '', state: '', pincode: '', country: 'India', phone: '', isDefault: false });
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-display font-bold mb-8">My Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Info */}
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <h2 className="font-display text-xl font-semibold mb-4">Personal Information</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={form.email}
                                disabled
                                className="bg-secondary-50"
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                            />
                            <Button type="submit" loading={loading}>
                                Save Changes
                            </Button>
                        </form>
                    </Card>

                    {/* Address Book */}
                    <Card className="p-6 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-display text-xl font-semibold">Address Book</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setShowAddAddress(!showAddAddress); setEditingAddress(null); }}
                            >
                                <FiPlus className="h-4 w-4 mr-1" /> Add Address
                            </Button>
                        </div>

                        {/* Address List */}
                        {customer?.addresses && customer.addresses.length > 0 ? (
                            <div className="space-y-3">
                                {customer.addresses.map((addr, idx) => (
                                    <div key={addr._id || idx} className="border border-secondary-200 rounded-lg p-4 flex justify-between items-start hover:bg-secondary-50 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{addr.line1}</p>
                                                {addr.isDefault && (
                                                    <span className="badge badge-success text-xs">Default</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-secondary-500">
                                                {addr.line2 && `${addr.line2}, `}
                                                {addr.city}, {addr.state} - {addr.pincode}
                                            </p>
                                            <p className="text-sm text-secondary-500">Phone: {addr.phone}</p>
                                            <p className="text-sm text-secondary-400">{addr.country}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditAddress(addr)}
                                                className="p-2 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Edit Address"
                                            >
                                                <FiEdit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAddress(addr._id)}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Address"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-3">📍</div>
                                <p className="text-secondary-500">No addresses saved</p>
                                <p className="text-sm text-secondary-400">Add your first address for faster checkout</p>
                            </div>
                        )}

                        {/* Add/Edit Address Form */}
                        {showAddAddress && (
                            <div className="mt-4 border-t border-secondary-200 pt-4">
                                <h3 className="font-medium mb-3 flex items-center gap-2">
                                    {editingAddress ? (
                                        <>✏️ Edit Address</>
                                    ) : (
                                        <>➕ Add New Address</>
                                    )}
                                </h3>
                                <form onSubmit={handleAddressSubmit} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <Input
                                                label="Address Line 1 *"
                                                name="line1"
                                                value={addressForm.line1}
                                                onChange={handleAddressChange}
                                                placeholder="123 Main Street"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                label="Address Line 2"
                                                name="line2"
                                                value={addressForm.line2}
                                                onChange={handleAddressChange}
                                                placeholder="Apartment, Suite, etc."
                                            />
                                        </div>
                                        <Input
                                            label="City *"
                                            name="city"
                                            value={addressForm.city}
                                            onChange={handleAddressChange}
                                            placeholder="Mumbai"
                                            required
                                        />
                                        <Input
                                            label="State *"
                                            name="state"
                                            value={addressForm.state}
                                            onChange={handleAddressChange}
                                            placeholder="Maharashtra"
                                            required
                                        />
                                        <Input
                                            label="Pincode *"
                                            name="pincode"
                                            value={addressForm.pincode}
                                            onChange={handleAddressChange}
                                            placeholder="400001"
                                            required
                                        />
                                        <Input
                                            label="Country"
                                            name="country"
                                            value={addressForm.country}
                                            onChange={handleAddressChange}
                                            placeholder="India"
                                        />
                                        <div className="col-span-2">
                                            <Input
                                                label="Phone *"
                                                name="phone"
                                                value={addressForm.phone}
                                                onChange={handleAddressChange}
                                                placeholder="9876543210"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isDefault"
                                            checked={addressForm.isDefault}
                                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                            className="h-4 w-4 text-primary-500 rounded"
                                        />
                                        <label htmlFor="isDefault" className="text-sm text-secondary-600">
                                            Set as default address
                                        </label>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button type="submit" loading={loading}>
                                            <FiCheck className="h-4 w-4 mr-1" />
                                            {editingAddress ? 'Update Address' : 'Add Address'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancelAddress}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Customer Stats */}
                <div>
                    <Card className="p-6">
                        <h2 className="font-display text-xl font-semibold mb-4">Customer Stats</h2>
                        {customer ? (
                            <div className="space-y-3">
                                <div className="flex justify-between border-b border-secondary-100 pb-2">
                                    <span className="text-secondary-600">Total Orders</span>
                                    <span className="font-bold text-secondary-900">{customer.totalOrders || 0}</span>
                                </div>
                                <div className="flex justify-between border-b border-secondary-100 pb-2">
                                    <span className="text-secondary-600">Lifetime Value</span>
                                    <span className="font-bold text-primary-500">₹{customer.lifetimeValue || 0}</span>
                                </div>
                                <div className="flex justify-between border-b border-secondary-100 pb-2">
                                    <span className="text-secondary-600">Addresses Saved</span>
                                    <span className="font-bold text-secondary-900">{customer.addresses?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-600">Member Since</span>
                                    <span className="font-bold text-secondary-900">
                                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-secondary-500">No customer data</p>
                                <p className="text-sm text-secondary-400">Complete your first order to get stats</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;