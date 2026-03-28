import { useQuery } from '@tanstack/react-query';

export type PlanTier = 'lite' | 'pro' | 'infinity';

export interface PlanInfo {
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
}

const PLAN_INFO: Record<PlanTier, PlanInfo> = {
  lite:     { nameAr: 'لايت',     nameEn: 'Lite',     icon: '⚡', color: '#6B7280' },
  pro:      { nameAr: 'برو',      nameEn: 'Pro',      icon: '🚀', color: '#8B5CF6' },
  infinity: { nameAr: 'انفينيتي', nameEn: 'Infinity', icon: '♾️', color: '#F59E0B' },
};

interface PlanConfig {
  plan: PlanTier;
  features: Record<string, boolean>;
  maxBranches: number;
  maxEmployees: number;
}

export function usePlan() {
  const { data, isLoading } = useQuery<PlanConfig>({
    queryKey: ['/api/subscription/config'],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const plan: PlanTier = data?.plan || 'pro';
  const features: Record<string, boolean> = data?.features || {};
  const planInfo: PlanInfo = PLAN_INFO[plan];

  const hasFeature = (feature: string): boolean => {
    if (plan === 'infinity') return true;
    if (feature in features) return features[feature];
    if (plan === 'pro') return true;
    return false;
  };

  const isPro = plan === 'pro' || plan === 'infinity';
  const isInfinity = plan === 'infinity';

  return { plan, features, planInfo, hasFeature, isPro, isInfinity, isLoading };
}

export default usePlan;
