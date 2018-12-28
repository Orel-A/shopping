import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ApiService } from "src/app/services/api.service";
import { LoginUser } from "src/app/models/User";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required]
    });
  }

  onSubmit(): void {
    const credentials: LoginUser = <LoginUser>Object.assign({}, this.loginForm.value);

    this.api.loginUser(credentials).catch(err => {
      if (err === "credentials don't match") this.loginForm.setErrors({ badCredentials: true });
    });
  }
}
