import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent {
  links = [
    { title: 'Sve objave', desc: 'Lista svih objava korisnika', path: '/posts' },
    { title: 'Trendovi mreže', desc: 'Popularno i trendovi', path: '/trends' },
    { title: 'Analitika aplikacije', desc: 'Grafici i KPI za admina', path: '/admin/analytics' },
    { title: 'Svi profili', desc: 'Pregled svih registrovanih korisnika', path: '/users' },
  ];
}
