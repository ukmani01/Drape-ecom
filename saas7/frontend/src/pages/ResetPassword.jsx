import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword as resetApi } from '../api/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetApi(token, password);
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-luxury p-8">
        <h2 className="text-center text-3xl font-display font-bold">Reset Password</h2>
        <form onSubmit={handleSubmit} className="mt-8">
          <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full mt-4" loading={loading}>Reset</Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
