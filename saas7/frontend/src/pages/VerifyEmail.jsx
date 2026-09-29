import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verifyEmail as verifyApi } from '../api/auth';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const { token } = useParams();
  useEffect(() => {
    verifyApi(token).then(() => toast.success('Email verified!')).catch(() => toast.error('Verification failed'));
  }, [token]);
  return <div className="text-center py-20">Verifying...</div>;
};

export default VerifyEmail;
