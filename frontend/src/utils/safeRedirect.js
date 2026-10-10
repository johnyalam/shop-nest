export const safeRedirect = (value) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : '/'