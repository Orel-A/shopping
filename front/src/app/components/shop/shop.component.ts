import { Component, OnInit } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { Product, Category, Cart } from "src/app/models/Shop";
import { fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged, map, filter } from "rxjs/operators";
import { PopoverDirective } from "ngx-bootstrap/popover/popover.directive";

@Component({
  selector: "app-shop",
  templateUrl: "./shop.component.html",
  styleUrls: ["./shop.component.css"]
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  // has get and set methods
  private _currentCategory: Category = null;
  // Minimize cart
  hideCart: boolean = false;
  // bs-popover
  currentPopup: PopoverDirective;
  currentProduct: Product;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.currentCategory = this.api.categories[0];

    fromEvent(document.getElementById("search-box"), "input")
      .pipe(
        map(e => (<HTMLInputElement>e.target).value.trim()),
        filter(text => text.length > 2),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(text => {
        this._currentCategory = null;
        this.api.fetchProductsByName(text).then(products => (this.products = products));
      });
  }

  get currentCategory() {
    return this._currentCategory;
  }

  set currentCategory(category: Category) {
    this._currentCategory = category;
    this.api.fetchProductsByCategory(category).then(products => (this.products = products));
  }

  onSwitchCategory(event: Event, category: Category) {
    event.preventDefault();
    this.currentCategory = category;
  }

  onAddProduct(quantity: number) {
    if (!this.api.cart || this.api.cart.closed) this.api.cart = <Cart>{created_date: new Date(), closed: false, items: [], final_cost: 0};

    quantity |= 0;
    this.currentPopup.hide();

    let getItemByProductId = productId => {
      for (const item of this.api.cart.items) if (item.product_id === productId) return item;
      return null;
    };

    // check if already exists
    let item = getItemByProductId(this.currentProduct.product_id);

    if (item) this.api.updateCartItem(item, item.quantity + quantity);
    else this.api.addCartItem(this.currentProduct, quantity);
  }

  onShowPopup(popup: PopoverDirective, product: Product) {
    this.currentPopup = popup;
    this.currentProduct = product;
  }
}
