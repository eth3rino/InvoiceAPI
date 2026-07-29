import { Component } from '@angular/core';
import { LucideDollarSign, LucideFileDown, LucideFileText } from '@lucide/angular';

@Component({
  selector: 'app-features',
  imports: [LucideFileText, LucideFileDown, LucideDollarSign],
  templateUrl: './features.html',
  styleUrl: './features.scss',
})
export class Features {}
