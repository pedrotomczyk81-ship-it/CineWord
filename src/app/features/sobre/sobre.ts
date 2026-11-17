import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessaoService } from '../../core/service/sessao.service';

@Component({
  selector: 'app-sobre',
  imports: [RouterLink],
  templateUrl: './sobre.html',
  styleUrl: './sobre.css',
})
export class Sobre {
  readonly service = inject(SessaoService);
}
