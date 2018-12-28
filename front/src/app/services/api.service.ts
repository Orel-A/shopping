import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { User, LoginUser, RegisterUser, RegisterStepOne } from "../models/User";
import { Cart, Product, Category, CartItem } from "../models/Shop";

interface AppData {
  stats: {
    totalProducts: number;
    totalOrders: number;
  };
  categories: Category[];
  user: User;
  cart: Cart;
}

@Injectable({
  providedIn: "root"
})
export class ApiService {
  private httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" })
  };
  private baseUrl = "/api";
  initalized = false;
  initPromise: Promise<void>;
  user: User = null;
  stats = {
    totalProducts: 0,
    totalOrders: 0
  };
  cart: Cart = null;
  categories: Category[] = [];
  cities = [
    "Jerusalem",
    "Tel Aviv",
    "Haifa",
    "Ashdod",
    "Rishon LeZiyyon",
    "Petah Tiqwa",
    "Beersheba",
    "Netanya",
    "Holon",
    "Bnei Brak"
  ];

  constructor(private http: HttpClient) {
    this.initPromise = new Promise(resolve => {
      this.http.get<AppData>(this.baseUrl + "/fetchAppData").subscribe(
        res => {
          this.stats = res.stats;
          this.user = res.user;
          this.cart = res.cart;
          this.categories = res.categories;
        },
        null,
        () => {
          this.initalized = true;
          resolve();
        }
      );
    });
  }

  createProduct(category_id, product_name, price, image_url): Promise<Product> {
    return this.http
      .post<Product>(this.baseUrl + "/products", { category_id, product_name, price, image_url }, this.httpOptions)
      .toPromise();
  }

  updateProduct(product: Product): Promise<Product> {
    return this.http.put<Product>(this.baseUrl + "/products", product, this.httpOptions).toPromise();
  }

  makeOrder(obj): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<Cart>(this.baseUrl + "/order", obj, this.httpOptions).subscribe(
        cart => {
          // not really necessary apart from setting closed to true
          this.cart = cart;
          resolve();
        },
        res => reject(res.error)
      );
    });
  }

  updateCartItem(item: CartItem, quantity: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.put<CartItem>(this.baseUrl + "/cartItems/" + item.product_id, { quantity }, this.httpOptions).subscribe(
        newItem => {
          this.cart.final_cost -= item.total_cost;
          this.cart.items[this.cart.items.indexOf(item)] = newItem;
          this.cart.final_cost += newItem.total_cost;
          resolve();
        },
        res => reject(res.error)
      );
    });
  }

  addCartItem(product: Product, quantity: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http
        .post<CartItem>(this.baseUrl + "/cartItems", { product_id: product.product_id, quantity }, this.httpOptions)
        .subscribe(
          item => {
            this.cart.final_cost += item.total_cost;
            this.cart.items.push(item);
            resolve();
          },
          res => reject(res.error)
        );
    });
  }

  deleteCartItem(item: CartItem): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete<any>(this.baseUrl + "/cartItems/" + item.product_id, this.httpOptions).subscribe(
        () => {
          this.cart.final_cost -= item.total_cost;
          this.cart.items.splice(this.cart.items.indexOf(item), 1);
          resolve();
        },
        res => reject(res.error)
      );
    });
  }

  deleteCart(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete<any>(this.baseUrl + "/cart", this.httpOptions).subscribe(
        () => {
          this.cart = null;
          resolve();
        },
        res => reject(res.error)
      );
    });
  }

  fetchProductsByName(name: string): Promise<Product[]> {
    return this.http.get<Product[]>(this.baseUrl + "/products/" + encodeURIComponent(name)).toPromise();
  }

  fetchProductsByCategory(category: Category): Promise<Product[]> {
    return this.http.get<Product[]>(this.baseUrl + `/category/${category.category_id}/products`).toPromise();
  }

  checkDuplicates(obj: RegisterStepOne): Promise<any> {
    return this.http.post<any>(this.baseUrl + "/checkDuplicates", obj, this.httpOptions).toPromise();
  }

  loginUser(credentials: LoginUser): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<AppData>(this.baseUrl + "/login", credentials, this.httpOptions).subscribe(
        res => {
          this.user = res.user;
          this.cart = res.cart;
          resolve();
        },
        res => reject(res.error)
      );
    });
  }

  registerUser(registerUser: RegisterUser): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<User>(this.baseUrl + "/register", registerUser, this.httpOptions).subscribe(
        user => {
          this.user = user;
          resolve();
        },
        res => reject(res.error)
      );
    });
  }

  logOut(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(this.baseUrl + "/logOut").subscribe(
        () => {
          this.user = null;
          resolve();
        },
        res => reject(res.error)
      );
    });
  }
}
