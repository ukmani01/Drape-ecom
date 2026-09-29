import React, { useState } from 'react';
import { forgotPassword as apiForgot } from '../api/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiForgot(email);
      toast.success('Password reset link sent to your email');
    } catch (err) {
      toast.error('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-luxury p-8">
        <h2 className="text-center text-3xl font-display font-bold">Forgot Password</h2>
        <form className="mt-8" onSubmit={handleSubmit}>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full mt-4" loading={loading}>Send Reset Link</Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
