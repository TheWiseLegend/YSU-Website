import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AdminAuthGuard } from './guards/admin-auth.guard';

// Import all page components
import { HomeComponent } from './pages/home/home.component';
import { StudentGuideComponent } from './pages/student-guide/student-guide.component';
import { UniversitiesComponent } from './pages/universities/universities.component';
import { NewsComponent } from './pages/news/news.component';
import { BranchesComponent } from './pages/branches/branches.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { UniversityDetailComponent } from './pages/university-detail/university-detail.component';
import { GalleryDetailComponent } from './pages/gallery-detail/gallery-detail.component';
import { NewsDetailComponent } from './pages/news-detail/news-detail.component';
import { BranchDetailComponent } from './pages/branch-detail/branch-detail.component';
import { EventsComponent } from './pages/events/events.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';

// Import admin components
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { AdminDashboardComponent } from './admin/admin-panel/dashboard/dashboard.component';
import { AdminNewsComponent } from './admin/admin-panel/news/news.component';
import { AdminEventsComponent } from './admin/admin-panel/events/events.component';
import { AdminGalleryComponent } from './admin/admin-panel/gallery/gallery.component';
import { AdminUnionTeamComponent } from './admin/admin-panel/union-team/union-team.component';
import { AdminBranchesComponent } from './admin/admin-panel/branches/branches.component';
import { BranchTeamComponent } from './admin/admin-panel/branch-team/branch-team.component';
import { AdminBranchDetailComponent } from './admin/admin-panel/branch-detail/branch-detail.component';
import { DigitalLibraryComponent } from './pages/digital-library/digital-library.component';
import { AdminMembersComponent } from './admin/admin-panel/members/admin-members.component';
import { AdminVendorsComponent } from './admin/admin-panel/vendors/vendors.component';


import { MembershipLayoutComponent } from './pages/membership/layout/membership-layout.component';
import { MembershipLoginComponent } from './pages/membership/login/membership-login.component';
import { MembershipSignupComponent } from './pages/membership/signup/membership-signup.component';
import { MembershipDashboardComponent } from './pages/membership/dashboard/membership-dashboard.component';
import { MembershipApplyComponent } from './pages/membership/apply/membership-apply.component';
import { MemberAuthGuard } from './guards/member-auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'student-guide', component: StudentGuideComponent },
      { path: 'universities', component: UniversitiesComponent },
      { path: 'universities/:id', component: UniversityDetailComponent },
      { path: 'news', component: NewsComponent },
      { path: 'news/:id', component: NewsDetailComponent },
      { path: 'branches', component: BranchesComponent },
      { path: 'branches/:id', component: BranchDetailComponent },
      { path: 'gallery', component: GalleryComponent },
      { path: 'gallery/:id', component: GalleryDetailComponent },
      { path: 'events', component: EventsComponent },
      { path: 'events/:id', component: EventDetailComponent }, // Added event detail route
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'digital-library', component: DigitalLibraryComponent } 
    ]
  },

    {
    path: 'membership',
    component: MembershipLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: MembershipLoginComponent },
      { path: 'signup', component: MembershipSignupComponent },
      {
        path: 'dashboard',
        component: MembershipDashboardComponent,
        canActivate: [MemberAuthGuard]
      },
      {
        path: 'apply',
        component: MembershipApplyComponent,
        canActivate: [MemberAuthGuard]
      },
    ]
  },


  // Hidden admin login route 
  { path: 'admin-ysu-login-e47b9f2ac81e4ffdb47d9a87c36c1abf', component: AdminLoginComponent },
  
  // Protected admin routes
  {
    path: 'admin-panel',
    component: AdminPanelComponent,
    canActivate: [AdminAuthGuard],
    canActivateChild: [AdminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'news', component: AdminNewsComponent },
      { path: 'events', component: AdminEventsComponent },
      { path: 'gallery', component: AdminGalleryComponent },
      { path: 'branches', component: AdminBranchesComponent },
      { path: 'team', component: AdminUnionTeamComponent },
      { path: 'branches/:id', component: AdminBranchDetailComponent },
      { path: 'branches/:id/team', component: BranchTeamComponent }, 
      { path: 'union-team', component: AdminUnionTeamComponent},
      { path: 'members', component: AdminMembersComponent },
      { path: 'vendors', component: AdminVendorsComponent },
    ]
  }
];