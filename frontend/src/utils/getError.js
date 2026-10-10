export const getError = (err) =>
  err.response?.data?.detail || err.response?.data?.message || err.message