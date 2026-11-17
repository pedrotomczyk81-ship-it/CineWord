import { Component, inject } from '@angular/core';
import { SessaoService } from '../../../core/service/sessao.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly service = inject(SessaoService);
}
