// utils/notificationConfig.js - Configuración centralizada de notificaciones
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  MATCH: 'match',
  MESSAGE: 'message',
  EVENT: 'event',
  WELCOME: 'welcome',
  TEST: 'test',
  GENERAL: 'general'
};

export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.LIKE]: '💕',
  [NOTIFICATION_TYPES.MATCH]: '🎉',
  [NOTIFICATION_TYPES.MESSAGE]: '💬',
  [NOTIFICATION_TYPES.EVENT]: '🎪',
  [NOTIFICATION_TYPES.WELCOME]: '🔔',
  [NOTIFICATION_TYPES.TEST]: '🧪',
  [NOTIFICATION_TYPES.GENERAL]: '📱'
};

export const NOTIFICATION_ACTIONS = {
  [NOTIFICATION_TYPES.LIKE]: [
    { action: 'view_profile', title: '👀 Ver perfil', icon: '/icons/ibento48x48.png' },
    { action: 'dismiss', title: '❌ Cerrar' }
  ],
  [NOTIFICATION_TYPES.MATCH]: [
    { action: 'open_chat', title: '💬 Chatear', icon: '/icons/ibento48x48.png' },
    { action: 'view_profile', title: '👀 Ver perfil' }
  ],
  [NOTIFICATION_TYPES.MESSAGE]: [
    { action: 'reply', title: '↩️ Responder', icon: '/icons/ibento48x48.png' },
    { action: 'open_chat', title: '👀 Ver chat' }
  ],
  [NOTIFICATION_TYPES.EVENT]: [
    { action: 'view_event', title: '🎪 Ver evento', icon: '/icons/ibento48x48.png' },
    { action: 'dismiss', title: '❌ Cerrar' }
  ]
};

export const NOTIFICATION_ROUTES = {
  view_profile: '/ibento/verLike',
  open_chat: '/ibento/chat',
  view_event: '/ibento/eventos',
  reply: '/ibento/chat'
};

export const NOTIFICATION_CONFIG = {
  icon: '/icons/ibento192x192.png',
  badge: '/icons/ibentoba.png',
  vibrate: [200, 100, 200],
  renotify: true,
  silent: false,
  requireInteraction: false, // Por defecto false, se puede cambiar por tipo
  tag: 'ibento-notification'
};

export const getNotificationConfig = (type, data = {}) => {
  const config = {
    ...NOTIFICATION_CONFIG,
    actions: NOTIFICATION_ACTIONS[type] || [{ action: 'open', title: '🔍 Abrir' }],
    tag: `ibento-${type}-${Date.now()}`,
    data: {
      type,
      timestamp: Date.now(),
      ...data
    }
  };

  // Configuraciones especiales por tipo
  switch (type) {
    case NOTIFICATION_TYPES.MATCH:
    case NOTIFICATION_TYPES.MESSAGE:
      config.requireInteraction = true;
      break;
    case NOTIFICATION_TYPES.LIKE:
      config.renotify = false; // No repetir para likes
      break;
    default:
      break;
  }

  return config;
};

export const getNavigationUrl = (action, baseUrl = '') => {
  const route = NOTIFICATION_ROUTES[action];
  if (!route) return baseUrl || '/';
  
  return baseUrl ? `${baseUrl}${route}` : route;
};
