export interface UserModel {
  email: string;
  password?: string;
  cart?: string;
  orders?: string;
  wishlist?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  generalInfo?: {
    address?: {
      addressLine1?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    comapny?: {
      name: string;
    };
  };
}
