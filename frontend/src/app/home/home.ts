import { Component } from '@angular/core';
import { Hero } from "./hero/hero";
import { Features } from './features/features';
import { Security } from './security/security';

@Component({
  selector: 'app-home',
  imports: [Hero, Features, Security],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
