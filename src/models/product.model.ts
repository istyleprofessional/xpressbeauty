export interface ProductModel {
  id?: string;
  quantity?: number;
  _id?: string;
  price?: any;
  product_name?: string;
  description?: string;
  item_no?: string;
  sale_price?: any;
  categories?: string[];
  imgs?: string[];
  quantity_on_hand?: string;
  sku?: string;
  manufacturer_part_number?: string;
  bar_code_value?: string;
  isDeleted?: boolean;
  isHidden?: boolean;
  status?: string;
  variation_type?: string;
  variations?: any[];
  cleanproductname?: string;
  // productsVariation?: any[];
  companyName?: string;
  lineName?: string;
  perfix?: string;
  priceType?: string;
  currency?: string;
}
