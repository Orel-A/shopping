import { Component } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: "app-order",
  templateUrl: "./order.component.html",
  styleUrls: ["./order.component.css"]
})
export class OrderComponent {
  orderForm: FormGroup;
  searchVal: string = "";
  today: string = new Date().toISOString().slice(0, 10);
  purchaseComplete: boolean = false;

  constructor(private api: ApiService, private fb: FormBuilder, private sanitizer: DomSanitizer) {
    this.orderForm = this.fb.group({
      city: [this.api.user.city, Validators.required],
      street: [this.api.user.street, Validators.required],
      delivery_date: [this.today, Validators.required],
      creditCard: ["", [Validators.required, this.creditCard]]
    });
  }

  creditCard(control: AbstractControl): ValidationErrors | null {
    let sanitized = control.value.replace(/[- ]+/g, "");
    let ok = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14})$/.test(
      sanitized
    );

    if (ok) {
      let sum = 0;
      let digit;
      let tmpNum;
      let shouldDouble;

      for (let i = sanitized.length - 1; i >= 0; i--) {
        digit = sanitized.substring(i, i + 1);
        tmpNum = parseInt(digit, 10);

        if (shouldDouble) {
          tmpNum *= 2;
          sum += tmpNum >= 10 ? (tmpNum % 10) + 1 : tmpNum;
        } else sum += tmpNum;

        shouldDouble = !shouldDouble;
      }

      ok = !!(sum % 10 === 0 ? sanitized : false);
    }

    return ok ? null : { creditCard: true };
  }

  onSubmit(): void {
    this.api
      .makeOrder(this.orderForm.value)
      .then(() => (this.purchaseComplete = true))
      .catch(err => {
        if (err === "busy date") this.orderForm.controls["delivery_date"].setErrors({ busyDate: true });
      });
  }

  genLinkURI() {
    let receipt = "";

    for (const item of this.api.cart.items)
      receipt += `Name: ${item.product_name} Quantity: ${item.quantity} Cost: ${item.total_cost}\r\n`;

    receipt += "\r\nFinal cost: " + this.api.cart.final_cost;

    return this.sanitizer.bypassSecurityTrustUrl("data:text/plain;charset=utf-8," + encodeURIComponent(receipt));
  }
}
