import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs";
import { ApiService } from "../services/api.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate {
  constructor(private api: ApiService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.api.initalized) {
      if (this.api.user) return true;
      this.router.navigate(["/login"]);
      return false;
    }

    return new Promise(resolve => {
      this.api.initPromise.then(() => {
        let grant = !!this.api.user;
        if (!grant) this.router.navigate(["/login"]);
        resolve(grant);
      });
    });
  }
}
