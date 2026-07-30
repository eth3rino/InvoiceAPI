import { Component } from '@angular/core';
import { Hero } from "./hero/hero";
import { Features } from './features/features';
import { Security } from './security/security';
import { DevReference } from './dev-reference/dev-reference';
import { HowItWorks } from './how-it-works/how-it-works';
import { FreelanceReference } from './freelance-reference/freelance-reference';
import { CallToAction } from './call-to-action/call-to-action';

@Component({
  selector: 'app-home',
  imports: [Hero, Features, Security, HowItWorks, DevReference, FreelanceReference, CallToAction],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
