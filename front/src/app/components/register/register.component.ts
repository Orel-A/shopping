import { Component } from "@angular/core";
import { RegisterUser, RegisterStepOne } from "src/app/models/User";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ApiService } from "src/app/services/api.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent {
  registerForm: FormGroup;
  resumeToStepTwo: boolean = false;

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router) {
    this.registerForm = this.fb.group({
      stepOne: this.fb.group(
        {
          id: ["", [Validators.required, Validators.pattern(/^\d+$/)]],
          email: ["", [Validators.required, Validators.email]],
          password: ["", [Validators.required, Validators.minLength(6)]],
          confirmPassword: ""
        },
        { validator: this.confirmPassword }
      ),
      stepTwo: this.fb.group({
        first_name: ["", Validators.required],
        last_name: ["", Validators.required],
        city: ["", Validators.required],
        street: ["", Validators.required]
      })
    });
  }

  confirmPassword(form: FormGroup) {
    return form.get("password").value === form.get("confirmPassword").value ? null : { mismatch: true };
  }

  checkStepOne(): void {
    const stepOne: any = this.registerForm.get("stepOne").value;
    const checkObj: RegisterStepOne = <RegisterStepOne>{
      id: stepOne.id,
      email: stepOne.email
    };

    this.api
      .checkDuplicates(checkObj)
      .then((obj: any) => {
        if (obj.id) this.registerForm.get("stepOne.id").setErrors({ duplicate: true });

        if (obj.email) this.registerForm.get("stepOne.email").setErrors({ duplicate: true });

        this.resumeToStepTwo = !obj.id && !obj.email;
      })
      .catch(_ => {});
  }

  onSubmit(): void {
    const user: RegisterUser = <RegisterUser>(
      Object.assign({}, this.registerForm.get("stepOne").value, this.registerForm.get("stepTwo").value)
    );

    this.api
      .registerUser(user)
      .then(() => this.router.navigate(["/"]))
      .catch(err => {
        if (err === "Duplicate id") this.registerForm.get("stepOne.id").setErrors({ duplicate: true });

        if (err === "Duplicate email") this.registerForm.get("stepOne.email").setErrors({ duplicate: true });

        if (err === "Invalid email") this.registerForm.get("stepOne.email").setErrors({ badEmail: true });

        if (this.registerForm.get("stepOne").invalid) this.resumeToStepTwo = false;
      });
  }
}
