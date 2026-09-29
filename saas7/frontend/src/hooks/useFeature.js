import { useAuth } from '../contexts/AuthContext';

// =============================================================
// 🔥 Custom Hook: Check if current user has a feature
// =============================================================
export const useFeature = (featureKey) => {
  const { subscription } = useAuth(); // Assuming AuthContext provides subscription

  if (!subscription || !subscription.plan) {
    return false;
  }

  const features = subscription.plan.features || {};
  return features[featureKey] || false;
};

// =============================================================
// 🔥 Advanced: Check numeric limit (e.g., maxProducts)
// =============================================================
export const useFeatureLimit = (featureKey) => {
  const { subscription } = useAuth();
  if (!subscription || !subscription.plan) {
    return null;
  }
  return subscription.plan.features?.[featureKey] ?? null;
};

// =============================================================
// 🔥 Check if user has access to a theme
// =============================================================
export const useThemeAccess = (themeId) => {
  const { subscription } = useAuth();
  if (!subscription || !subscription.plan) {
    return false;
  }
  const allowedThemes = subscription.plan.features?.themeAccess || [];
  return allowedThemes.includes(parseInt(themeId));
};