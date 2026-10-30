/**
 * Central Dental Visual Assets
 * High-fidelity clinic imagery generated for PearlDent Oral Care.
 * Bundled via Vite ESM imports with reliable cloud fallbacks.
 */

import heroLocal from './images/hero_dental_clinic_1793350849969.jpg';
import consultationLocal from './images/dental_consultation_care_1793350850920.jpg';
import treatmentSuiteLocal from './images/dental_treatment_suite_1793350851703.jpg';
import smileAestheticLocal from './images/dental_smile_aesthetic_1793350851898.jpg';

export const CLINIC_FALLBACKS = {
  hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
  consultation: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80',
  treatmentSuite: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1000&q=80',
  smileAesthetic: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=1000&q=80',
};

export const CLINIC_IMAGES = {
  hero: heroLocal || CLINIC_FALLBACKS.hero,
  consultation: consultationLocal || CLINIC_FALLBACKS.consultation,
  treatmentSuite: treatmentSuiteLocal || CLINIC_FALLBACKS.treatmentSuite,
  smileAesthetic: smileAestheticLocal || CLINIC_FALLBACKS.smileAesthetic,
};

export const handleImageFallback = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackKey: keyof typeof CLINIC_FALLBACKS
) => {
  const target = e.currentTarget;
  const fallbackUrl = CLINIC_FALLBACKS[fallbackKey];
  if (target.src !== fallbackUrl) {
    target.src = fallbackUrl;
  }
};
