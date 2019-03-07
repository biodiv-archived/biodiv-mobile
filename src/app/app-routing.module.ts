import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: "login",
    loadChildren: "./pages/auth/login/login.module#LoginPageModule"
  },
  {
    path: "signup",
    loadChildren: "./pages/auth/signup/signup.module#SignupPageModule"
  },
  {
    path: "logout",
    loadChildren: "./pages/auth/logout/logout.module#LogoutPageModule"
  },
  {
    path: "user-observations",
    loadChildren:
      "./pages/user/observations/observations.module#ObservationsPageModule"
  },
  {
    path: "user-observation-info",
    loadChildren:
      "./pages/user/observation-info/observation-info.module#ObservationInfoPageModule"
  },
  {
    path: "user-observation-create",
    loadChildren:
      "./pages/user/observation-create/observation-create.module#ObservationCreatePageModule"
  },
  {
    path: "user-settings",
    loadChildren: "./pages/user/settings/settings.module#SettingsPageModule"
  },
  {
    path: "user-groups",
    loadChildren: "./pages/user/groups/groups.module#GroupsPageModule"
  },
  {
    path: "app-about",
    loadChildren: "./pages/about/about.module#AboutPageModule"
  },
  {
    path: "user-observations-local",
    loadChildren:
      "./pages/user/observations-local/observations-local.module#ObservationsLocalPageModule"
  },
  {
    path: "user-forgot-password",
    loadChildren:
      "./pages/auth/forgot-password/forgot-password.module#ForgotPasswordPageModule"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
