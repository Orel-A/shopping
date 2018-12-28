import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { ShopComponent } from './components/shop/shop.component';
import { AuthGuard } from './guards/auth.guard';
import { OrderComponent } from './components/order/order.component';
import { AdminCPComponent } from './components/admin-cp/admin-cp.component';

const routes: Routes = [
  { path: "admin-cp", component: AdminCPComponent, canActivate: [AuthGuard] },
  { path: "order", component: OrderComponent, canActivate: [AuthGuard] },
  { path: "shop", component: ShopComponent, canActivate: [AuthGuard] },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "", pathMatch: "full", redirectTo: "login" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
