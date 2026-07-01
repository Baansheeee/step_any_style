export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';

const logEventToDatabase = (eventName: string, options: any) => {
  if (typeof window !== 'undefined') {
    if (window.location.pathname.startsWith('/admin')) {
      return;
    }
    
    fetch('/api/marketing/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventData: options,
        url: window.location.href,
      }),
    }).catch((err) => console.warn('Failed to log event to database', err));
  }
};

export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
    logEventToDatabase('PageView', {});
  }
};

export const event = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, options);
    logEventToDatabase(name, options);
  }
};
