import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Sessao } from '../../core/models/sessao.model';
import { SessaoService } from '../../core/service/sessao.service';

@Component({
  selector: 'app-admin',
  imports: [DatePipe, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private readonly sessaoService = inject(SessaoService);

  sessoes: Sessao[] = [];
  carregando = true;
  mensagemErro = '';
  excluindoId = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.sessaoService.getAll().subscribe({
      next: (sessoes) => {
        this.sessoes = sessoes;
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro =
          'Não foi possível carregar as sessões. Confira a URL do Firebase.';
        this.carregando = false;
      },
    });
  }

  excluir(sessao: Sessao): void {
    const confirmou = window.confirm(
      `Deseja realmente excluir a sessão de “${sessao.filme}”?`,
    );

    if (!confirmou) {
      return;
    }

    this.excluindoId = sessao.id;
    this.mensagemErro = '';

    this.sessaoService.delete(sessao.id).subscribe({
      next: () => {
        this.sessoes = this.sessoes.filter(({ id }) => id !== sessao.id);
        this.excluindoId = '';
      },
      error: () => {
        this.mensagemErro = 'Não foi possível excluir a sessão.';
        this.excluindoId = '';
      },
    });
  }
}
