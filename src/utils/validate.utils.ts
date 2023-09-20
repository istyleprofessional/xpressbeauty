export const validate = (arg: string, type: string) => {
  // debugger;
  if (type.toLowerCase().includes("email")) {
    const re = /\S+@\S+\.\S+/;
    return re.test(arg);
  }
  if (type.toLowerCase().includes("password")) {
    const re = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    return re.test(arg);
  }
  if (type.toLowerCase().includes("name")) {
    const re = /^[a-zA-Z]+$/;
    return re.test(arg);
  }
  if (type.toLowerCase().includes("phone")) {
    const re = /^\+[1-9]{1}[0-9]{3,14}$/;
    return re.test(arg);
  }
  if (type.toLowerCase().includes("otp")) {
    const re = /^[0-9]{5}$/;
    return re.test(arg);
  }
  if (type.toLowerCase().includes("postal")) {
    const usPattern = /^\d{5}(?:-\d{4})?$/;
    const canadaPattern =
      /^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$/;

    arg = arg.replace(/\s+/g, "").toUpperCase();
    if (
      (arg.match(usPattern) && arg.length === 5) ||
      (arg.match(canadaPattern) && arg.length === 6)
    ) {
      return true; // Valid postal code
    } else {
      return false; // Invalid postal code
    }
  }
  if (type.toLowerCase().includes("address")) {
    const re = /^[a-zA-Z0-9\s,'-]*$/;
    return re.test(arg);
  }
  if (type.toLowerCase().includes("city")) {
    const re = /^[a-zA-Z\s]*$/;
    return re.test(arg);
  }
  if (type.toLowerCase().includes("country")) {
    const re = /^[a-zA-Z\s]*$/;
    return re.test(arg);
  }
  if (type.toLowerCase().includes("state")) {
    const re = /^[a-zA-Z\s]*$/;
    return re.test(arg);
  }
};
