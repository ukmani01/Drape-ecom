import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../../api/settings';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import toast from 'react-hot-toast';

const OwnerGlobalSettings = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['owner-global-settings'],
        queryFn: () => getSettings().then(res => res.data.data),
    });
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        siteName: '',
        siteLogo: '',    // ✅ NEW
        tagline: '',
    });

    useEffect(() => {
        if (data) {
            setForm({
                siteName: data.brand?.name || '',
                siteLogo: data.brand?.logo || '',   // ✅ NEW
                tagline: data.brand?.tagline || '',
            });
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries(['owner-global-settings']);
            queryClient.invalidateQueries(['settings']);
            toast.success('Settings updated');
        },
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // ✅ NEW: Logo Upload Handler
    const handleLogoUpload = (imageData) => {
        setForm({ ...form, siteLogo: imageData.url });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({
            brand: {
                name: form.siteName,
                logo: form.siteLogo,   // ✅ NEW
                tagline: form.tagline,
            },
        });
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-display font-bold mb-6">Global Settings</h1>
            <Card className="p-6 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Site Name"
                        name="siteName"
                        value={form.siteName}
                        onChange={handleChange}
                    />
                    <Input
                        label="Tagline"
                        name="tagline"
                        value={form.tagline}
                        onChange={handleChange}
                    />
                    {/* ✅ NEW: Logo Upload */}
                    <div className="mt-2">
                        <label className="label-luxury">Site Logo</label>
                        <ImageUpload
                            onUpload={handleLogoUpload}
                            folder="logo"
                            existingImage={form.siteLogo}
                        />
                        <p className="text-xs text-secondary-500 mt-1">Recommended: Square image, max 200x200px.</p>
                    </div>
                    <Button type="submit" loading={mutation.isLoading}>Save Settings</Button>
                </form>
            </Card>
        </div>
    );
};

export default OwnerGlobalSettings;