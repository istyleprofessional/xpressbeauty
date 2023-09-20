export const generateOrderNumber = () => {
  const alphanu =
    Date.now().toString(36) + Math.random().toString(36).substring(13);
  return alphanu;
};
