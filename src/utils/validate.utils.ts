export const validate = (arg: string, type: string) => {
  if (type === "Email") {
    const re = /\S+@\S+\.\S+/;
    return re.test(arg);
  }
  if (type === "Password") {
    const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(arg);
  }
  if (type === "Name") {
    const re = /^[a-zA-Z]+$/;
    return re.test(arg);
  }
  if (type === "Phone") {
    const re = /^[0-9]+$/;
    return re.test(arg);
  }
};
