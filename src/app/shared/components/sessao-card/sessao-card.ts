import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Sessao } from '../../../core/models/sessao.model';

@Component({
  selector: 'app-sessao-card',
  imports: [DatePipe, RouterLink],
  templateUrl: './sessao-card.html',
  styleUrl: './sessao-card.css',
})
export class SessaoCard {
  readonly sessao = input.required<Sessao>();
  readonly somenteCartaz = input(false);
}
