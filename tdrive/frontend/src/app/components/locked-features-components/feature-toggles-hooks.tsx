/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import FeatureTogglesService, {
  FeatureNames,
} from 'app/features/global/services/feature-toggles-service';
import { FeatureToggles, Feature, withFeatures } from '@paralleldrive/react-feature-toggles';
import { useCurrentCompany } from 'app/features/companies/hooks/use-companies';

export const useFeatureToggles = () => {
  const { activeFeatureNames } = FeatureTogglesService;
  const { company } = useCurrentCompany();

  useEffect(() => {
    const companyPlan = company?.plan;
    companyPlan && FeatureTogglesService.setFeaturesFromCompanyPlan(companyPlan as any);
  }, [JSON.stringify(company)]);

  return {
    activeFeatureNames,
    FeatureToggles,
    Feature,
    withFeatures,
    FeatureNames,
  };
};
