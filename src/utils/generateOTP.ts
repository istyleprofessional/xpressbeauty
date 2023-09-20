// Generate a random 5-digit OTP
export function generateUniqueInteger(): string {
  let otp = "";
  for (let i = 0; i < 5; i++) {
    otp += (Math.floor(Math.random() * (9 - 0 + 1)) + 0).toString();
  }
  return otp;
}
