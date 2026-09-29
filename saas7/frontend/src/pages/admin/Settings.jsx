import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../../api/settings';
import { getCategories } from '../../api/categories';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import toast from 'react-hot-toast';
import { updatePaymentGateway } from '../../api/stores'; // 🔥 NEW: API Import

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    brandName: '',
    brandLogo: '',
    tagline: '',
    heroTitle: '',
    heroDescription: '',
    heroImage: '',
    heroButtonText: 'Shop Now',
    heroButtonLink: '/products',
    featuredTitle: 'Featured Products',
    featuredSubtitle: '',
    featuredCategoryId: '',
    aboutText: '',
    footerAddress: '',
    footerPhone: '',
    footerEmail: '',
    footerCopyright: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    pinterest: '',
    whatsapp: '',
    // 🔥 NEW: Payment Gateway Fields
    razorpayKeyId: '',
    razorpayKeySecret: '',
  });

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchData = async () => {
      try {
        const [settingsRes, categoriesRes] = await Promise.all([
          getSettings(),
          getCategories(),
        ]);

        const data = settingsRes.data.data;
        setCategories(categoriesRes.data.data?.docs || []);

        setForm({
          brandName: data.brand?.name || '',
          brandLogo: data.brand?.logo || '',
          tagline: data.brand?.tagline || '',
          heroTitle: data.hero?.title || '',
          heroDescription: data.hero?.description || '',
          heroImage: data.hero?.image || '',
          heroButtonText: data.hero?.buttonText || 'Shop Now',
          heroButtonLink: data.hero?.buttonLink || '/products',
          featuredTitle: data.homepage?.featuredTitle || 'Featured Products',
          featuredSubtitle: data.homepage?.featuredSubtitle || '',
          featuredCategoryId: data.homepage?.featuredCategoryId || '',
          aboutText: data.homepage?.aboutText || '',
          footerAddress: data.footer?.address || '',
          footerPhone: data.footer?.phone || '',
          footerEmail: data.footer?.email || '',
          footerCopyright: data.footer?.copyright || '',
          facebook: data.footer?.socialLinks?.facebook || '',
          instagram: data.footer?.socialLinks?.instagram || '',
          twitter: data.footer?.socialLinks?.twitter || '',
          youtube: data.footer?.socialLinks?.youtube || '',
          linkedin: data.footer?.socialLinks?.linkedin || '',
          pinterest: data.footer?.socialLinks?.pinterest || '',
          whatsapp: data.footer?.socialLinks?.whatsapp || '',
          razorpayKeyId: '', // Initially empty
          razorpayKeySecret: '',
        });
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success('Settings updated');
      fetchedRef.current = false;
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  // =============================================================
  // 🔥 NEW: Store Payment Gateway Save Handler
  // =============================================================
  const handlePaymentGatewaySave = async () => {
    if (!form.razorpayKeyId || !form.razorpayKeySecret) {
      toast.error('Please fill both Key ID and Secret.');
      return;
    }
    try {
      const res = await updatePaymentGateway({
        razorpayKeyId: form.razorpayKeyId,
        razorpayKeySecret: form.razorpayKeySecret,
      });
      toast.success(res.data.message || 'Gateway configured successfully!');
      // Security: Secret-ஐ Clear பண்ணு (Display-ல வைக்காதே)
      setForm({ ...form, razorpayKeySecret: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save gateway.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleHeroImageUpload = (imageData) => {
    setForm({ ...form, heroImage: imageData.url });
  };

  const handleLogoUpload = (imageData) => {
    setForm({ ...form, brandLogo: imageData.url });
  };

  const socialIcons = [
    { key: 'facebook', icon: '📘', label: 'Facebook URL' },
    { key: 'instagram', icon: '📷', label: 'Instagram URL' },
    { key: 'twitter', icon: '🐦', label: 'Twitter/X URL' },
    { key: 'youtube', icon: '▶️', label: 'YouTube URL' },
    { key: 'linkedin', icon: '🔗', label: 'LinkedIn URL' },
    { key: 'pinterest', icon: '📌', label: 'Pinterest URL' },
    { key: 'whatsapp', icon: '💬', label: 'WhatsApp URL' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      brand: {
        name: form.brandName,
        logo: form.brandLogo,
        tagline: form.tagline,
      },
      hero: {
        title: form.heroTitle,
        description: form.heroDescription,
        image: form.heroImage,
        buttonText: form.heroButtonText,
        buttonLink: form.heroButtonLink,
      },
      homepage: {
        featuredTitle: form.featuredTitle,
        featuredSubtitle: form.featuredSubtitle,
        featuredCategoryId: form.featuredCategoryId,
        aboutText: form.aboutText,
      },
      footer: {
        address: form.footerAddress,
        phone: form.footerPhone,
        email: form.footerEmail,
        copyright: form.footerCopyright,
        socialLinks: {
          facebook: form.facebook,
          instagram: form.instagram,
          twitter: form.twitter,
          youtube: form.youtube,
          linkedin: form.linkedin,
          pinterest: form.pinterest,
          whatsapp: form.whatsapp,
        },
      },
    };
    mutation.mutate(payload);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-display font-bold mb-6">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Brand Card */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Brand</h2>
          <Input label="Store Name" name="brandName" value={form.brandName} onChange={handleChange} />
          <Input label="Tagline" name="tagline" value={form.tagline} onChange={handleChange} />
          <div className="mt-4">
            <label className="label-luxury">Brand Logo</label>
            <ImageUpload onUpload={handleLogoUpload} folder="logo" existingImage={form.brandLogo} />
            <p className="text-xs text-secondary-500 mt-1">Recommended: Square image, max 200x200px.</p>
          </div>
        </Card>

        {/* Hero Card */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Hero Section</h2>
          <Input label="Hero Title" name="heroTitle" value={form.heroTitle} onChange={handleChange} />
          <Input label="Hero Description" name="heroDescription" value={form.heroDescription} onChange={handleChange} />
          <Input label="Button Text" name="heroButtonText" value={form.heroButtonText} onChange={handleChange} />
          <Input label="Button Link" name="heroButtonLink" value={form.heroButtonLink} onChange={handleChange} />
          <div className="mt-4">
            <label className="label-luxury">Hero Image</label>
            <ImageUpload onUpload={handleHeroImageUpload} folder="hero" existingImage={form.heroImage} />
          </div>
        </Card>

        {/* Homepage Card */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Home Page</h2>
          <Input label="Featured Section Title" name="featuredTitle" value={form.featuredTitle} onChange={handleChange} />
          <Input label="Featured Section Subtitle" name="featuredSubtitle" value={form.featuredSubtitle} onChange={handleChange} />
          <div className="mt-3">
            <label className="label-luxury">Featured Category (Show All Button)</label>
            <select name="featuredCategoryId" value={form.featuredCategoryId} onChange={handleChange} className="input-luxury">
              <option value="">All Products</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <p className="text-xs text-secondary-500 mt-1">"Show All" button will open this category</p>
          </div>
          <div className="mt-3">
            <label className="label-luxury">Description Text (3-5 lines)</label>
            <textarea name="aboutText" value={form.aboutText} onChange={handleChange} rows="3" className="input-luxury" />
          </div>
        </Card>

        {/* Footer Card */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Footer</h2>
          <Input label="Address" name="footerAddress" value={form.footerAddress} onChange={handleChange} />
          <Input label="Phone" name="footerPhone" value={form.footerPhone} onChange={handleChange} />
          <Input label="Email" name="footerEmail" value={form.footerEmail} onChange={handleChange} />
          <Input label="Copyright Text" name="footerCopyright" value={form.footerCopyright} onChange={handleChange} />
        </Card>

        {/* Social Media Card */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Social Media Links</h2>
          <p className="text-sm text-secondary-500 mb-4">Paste full URLs</p>
          <div className="space-y-3">
            {socialIcons.map(({ key, icon, label }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xl text-secondary-500 flex-shrink-0 w-6 text-center">{icon}</span>
                <Input label="" name={key} value={form[key]} onChange={handleChange} placeholder={label} className="flex-1" />
              </div>
            ))}
          </div>
        </Card>

        {/* ============================================================= */}
        {/* 🔥 NEW: Payment Gateway Card (Store Owner Razorpay Setup) */}
        {/* ============================================================= */}
        <Card className="p-6 border-2 border-orange-200 bg-orange-50/30">
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            💳 Payment Gateway (Razorpay)
            <span className="text-xs font-normal bg-green-100 text-green-700 px-2 py-1 rounded-full">Secure (AES-256)</span>
          </h2>
          <p className="text-sm text-secondary-600 mb-4">
            Enter your Razorpay Live/Test Keys. Customers will pay directly to your account.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Razorpay Key ID"
              name="razorpayKeyId"
              value={form.razorpayKeyId || ''}
              onChange={handleChange}
              placeholder="rzp_live_XXXXXXXX"
            />
            <Input
              label="Razorpay Key Secret"
              name="razorpayKeySecret"
              type="password"
              value={form.razorpayKeySecret || ''}
              onChange={handleChange}
              placeholder="Enter Secret (will be encrypted)"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-2"
            onClick={handlePaymentGatewaySave}
          >
            Save Payment Gateway
          </Button>
          <p className="text-xs text-secondary-500 mt-2">🔒 Keys are encrypted with AES-256-GCM before saving. <br /> This is the highest security standard.</p>
        </Card>
        {/* ============================================================= */}

        <Button type="submit" loading={mutation.isLoading}>Save All Settings</Button>
      </form>
    </div>
  );
};

export default AdminSettings;