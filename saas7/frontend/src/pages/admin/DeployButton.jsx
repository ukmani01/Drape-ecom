import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi';

const DeployButton = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [url, setUrl] = useState('');
  const [version, setVersion] = useState(0);

  const storeId = user?.storeId;

  const resolveStorefrontUrl = (storeUrl) => {
    if (!storeUrl) return '';
    try {
      const apiOrigin = new URL(api.defaults.baseURL || '/api', window.location.origin).origin;
      return new URL(storeUrl, `${apiOrigin}/`).toString();
    } catch {
      return storeUrl;
    }
  };

  // Fetch current deployment status on mount
  useEffect(() => {
    if (storeId) {
      fetchStatus();
    }
  }, [storeId]);

  const fetchStatus = async () => {
    try {
      const res = await api.get(`/stores/${storeId}/deploy/status`);
      const data = res.data.data;
      setStatus(data.deployStatus);
      setUrl(resolveStorefrontUrl(data.url));
      setVersion(data.deploymentVersion || 0);
    } catch (err) {
      // If 404 or error, assume not deployed
      setStatus('pending');
    }
  };

  const handleDeploy = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await api.post(`/stores/${storeId}/deploy`);
      const data = res.data.data;
      const storefrontUrl = resolveStorefrontUrl(data.url);
      setUrl(storefrontUrl);
      setVersion(data.version);
      setStatus('success');
      alert(`✅ Store deployed successfully!\nURL: ${storefrontUrl}`);
    } catch (err) {
      setStatus('failed');
      alert('❌ Deployment failed: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!storeId) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-2">Storefront Deployment</h3>
      
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={handleDeploy}
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          {loading ? (
            <>
              <FiRefreshCw className="animate-spin inline mr-2" />
              Deploying...
            </>
          ) : (
            '🚀 Deploy Store'
          )}
        </button>

        {status === 'success' && url && (
          <span className="text-sm text-green-600 flex items-center">
            ✅ Live v{version}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-500 hover:underline flex items-center"
            >
              View Store <FiExternalLink className="ml-1" />
            </a>
          </span>
        )}

        {status === 'failed' && (
          <span className="text-sm text-red-600">❌ Deployment failed</span>
        )}
      </div>

      {status === 'success' && url && (
        <div className="mt-2 text-sm text-gray-500">
          Share this URL with customers: 
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-500 ml-1">
            {url}
          </a>
        </div>
      )}
    </div>
  );
};

export default DeployButton;