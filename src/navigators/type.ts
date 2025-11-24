export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Products: { userDetail?: object; refresh?: boolean } | undefined;
  AddProduct: undefined;
  ProductDetail: { product: any };
  Cart: { refresh?: boolean } | undefined;
  Wishlist: { refresh?: boolean } | undefined;
  Profile: undefined;
  ProfileRecords : undefined;
  FormScreen : {id : number};

};
