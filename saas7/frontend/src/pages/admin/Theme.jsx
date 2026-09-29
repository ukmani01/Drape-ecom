import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getThemes, applyTheme } from '../../api/themes';
import { getSubscriptionStatus } from '../../api/subscriptions';
import { useTheme } from '../../providers/ThemeProvider';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const AdminTheme = () => {
  const { currentTheme, switchTheme } = useTheme();
  const queryClient = useQueryClient();

  // =============================================================
  // 🔥 Fetch Themes & Subscription (for access control)
  // =============================================================
  const { data: themesData, isLoading: themesLoading } = useQuery({
    queryKey: ['admin-themes'],
    queryFn: () => getThemes().then(res => res.data.data),
  });

  const { data: subscriptionData, isLoading: subLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => getSubscriptionStatus().then(res => res.data.data),
  });

  // =============================================================
  // 🔥 Apply Theme Mutation
  // =============================================================
  const applyMutation = useMutation({
    mutationFn: applyTheme,
    onSuccess: (_, themeId) => {
      // ✅ Success - Switch Theme Locally
      switchTheme(themeId);
      queryClient.invalidateQueries(['settings']);
      toast.success(themeId === 0 ? 'Default theme restored!' : 'Theme applied successfully!');
    },
    onError: (err) => {
      if (err.response?.status === 403) {
        const message = err.response?.data?.message || 'This theme is not available in your current plan. Please upgrade.';
        toast.error(message);
      } else {
        toast.error(err.response?.data?.message || 'Failed to apply theme. Please try again.');
      }
    },
  });

  if (themesLoading || subLoading) return <div>Loading...</div>;

  const themes = themesData || [];
  const plan = subscriptionData?.plan;
  const allowedThemeIds = plan?.features?.themeAccess || [];

  // =============================================================
  // 🔥 Default Theme (Always Available - No Subscription Required)
  // =============================================================
  const defaultTheme = {
    id: 0,
    name: 'Default Theme',
    description: 'Revert to base default styles (Orange/Classic)',
    isPremium: false,
  };

  // Filter themes based on subscription plan
  const filteredThemes = themes.filter(theme => {
    if (!allowedThemeIds.length) return false;
    return allowedThemeIds.includes(theme.id);
  });

  // If user has unlimited access (Enterprise), show all
  const showAllThemes = allowedThemeIds.includes(-1) || allowedThemeIds.length === 0;
  const displayThemes = showAllThemes ? themes : filteredThemes;

  // Add default theme to the beginning
  const allThemes = [defaultTheme, ...displayThemes];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Theme Selection</h1>

      {!showAllThemes && filteredThemes.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <p className="text-yellow-700">No themes available in your current plan. Please upgrade to access more themes.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allThemes.map((theme) => {
          const isActive = theme.id === currentTheme;

          // Default theme is always allowed
          const isAllowed = theme.id === 0 || allowedThemeIds.includes(theme.id) || showAllThemes;
          const isDisabled = applyMutation.isLoading || isActive || !isAllowed;

          return (
            <Card key={theme.id} className={`overflow-hidden ${!isAllowed ? 'opacity-50 grayscale' : ''}`}>
              <div className="p-4">
                <h3 className="font-display font-semibold">{theme.name}</h3>
                <p className="text-sm text-secondary-500">{theme.description}</p>

                {!isAllowed && theme.id !== 0 && (
                  <span className="inline-block mt-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    Upgrade Required
                  </span>
                )}
                {theme.id === 0 && (
                  <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Always Free
                  </span>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className={`badge ${isActive ? 'badge-success' : 'badge-neutral'}`}>
                    {isActive ? 'Active' : 'Not Active'}
                  </span>
                  <Button
                    variant={isActive ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => applyMutation.mutate(theme.id)}
                    disabled={isDisabled}
                  >
                    {isActive ? 'Active' : !isAllowed ? 'Upgrade' : 'Apply'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTheme;