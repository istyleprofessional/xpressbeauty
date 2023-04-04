export const validate = (arg: string, type: string) => {
  if (type === "Email") {
    const re = /\S+@\S+\.\S+/;
    return re.test(arg);
  }
  if (type === "Password") {
    const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(arg);
  }
};
