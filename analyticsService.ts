import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log("GA4 Initialized");
  }
};

export const trackPageView = (path: string) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: "pageview", page: path });
  }
};

export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

// Specific event helpers
export const trackCategorySelection = (categoryName: string) => {
  trackEvent("Engagement", "select_category", categoryName);
};

export const trackTopicGeneration = (categoryName: string, topic: string) => {
  trackEvent("AI", "generate_topic", `${categoryName}: ${topic}`);
};

export const trackStartPrep = (topic: string) => {
  trackEvent("Interaction", "start_prep", topic);
};

export const trackSessionComplete = (topic: string, duration: number) => {
  trackEvent("Interaction", "complete_session", topic, duration);
};

export const trackFeedbackReceived = (topic: string) => {
  trackEvent("AI", "received_feedback", topic);
};
