import { Routes } from '@angular/router';
import { Home } from './home/home';
import { NotFound } from './not-found/not-found';

export const routes: Routes = [
    {path: '', pathMatch: 'full', component: Home},
    {path: '**', component: NotFound}
];
