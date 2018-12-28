import { Component, OnInit } from "@angular/core";
import { Product, Category } from "src/app/models/Shop";
import { ApiService } from "src/app/services/api.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-admin-cp",
  templateUrl: "./admin-cp.component.html",
  styleUrls: ["./admin-cp.component.css"]
})
export class AdminCPComponent implements OnInit {
  products: Product[] = [];
  // has get and set methods
  private _currentCategory: Category = null;
  currentProduct: Product = null;
  productForm: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.productForm = this.fb.group({
      product_name: ["", Validators.required],
      price: ["", Validators.required],
      image_url: ["", Validators.required]
    });
  }

  ngOnInit() {
    this.currentCategory = this.api.categories[0];
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

  onSubmit() {
    // create a new product
    if (!this.currentProduct)
      this.api
        .createProduct(
          this.currentCategory.category_id,
          this.productForm.value["product_name"],
          this.productForm.value["price"],
          this.productForm.value["image_url"]
        )
        .then(product => this.products.push(product));
    else
      this.api
        .updateProduct(Object.assign({}, this.currentProduct, this.productForm.value))
        .then(product => Object.assign(this.currentProduct, product)); // by refrence
  }

  onNewProduct() {
    this.currentProduct = null;
    this.productForm.reset();
  }

  onSelectProduct(product: Product) {
    this.currentProduct = product;
    this.productForm.setValue({
      product_name: product.product_name,
      price: product.price,
      image_url: product.image_url
    });
  }
}
