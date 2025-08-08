let logoutCallback = null;

export const registerLogoutCallback = (callback) => {
  logoutCallback = callback;
};

export const triggerLogout = () => {
  if (logoutCallback) {
    logoutCallback();
  }
};
