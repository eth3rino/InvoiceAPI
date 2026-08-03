import { Component } from '@angular/core';
import { Hero } from "./hero/hero";
import { Features } from './features/features';
import { Security } from './security/security';
import { DevReference } from './dev-reference/dev-reference';
import { HowItWorks } from './how-it-works/how-it-works';
import { FreelanceReference } from './freelance-reference/freelance-reference';
import { Footer } from './footer/footer';
import { Header } from './header/header';

@Component({
  selector: 'app-home',
  imports: [Hero, Features, Security, HowItWorks, DevReference, FreelanceReference, Footer, Header],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
