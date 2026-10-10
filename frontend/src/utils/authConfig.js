export const authConfig = (getState) => ({
  headers: { Authorization: `Bearer ${getState().user.userInfo?.token}` },
})