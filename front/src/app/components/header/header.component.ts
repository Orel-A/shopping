import { Component } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { Router } from '@angular/router';

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent {
  isCollapsed: boolean = true;

  constructor(private api: ApiService, private router: Router) {}

  logOut(event: Event): void {
    event.preventDefault();
    this.api.logOut();
    this.router.navigate(['/login']);
  }
}
