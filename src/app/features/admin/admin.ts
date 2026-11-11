import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Sessao } from '../../core/models/sessao.model';
import { SessaoService } from '../../core/service/sessao.service';

@Component({
  selector: 'app-admin',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private readonly sessaoService = inject(SessaoService);

  readonly sessoes = signal<Sessao[]>([]);
  readonly busca = signal('');
  readonly filtroStatus = signal<'todas' | 'disponiveis' | 'indisponiveis'>('todas');

  readonly sessoesFiltradas = computed(() => {
    const termo = this.busca().trim().toLocaleLowerCase('pt-BR');
    const status = this.filtroStatus();

    return this.sessoes()
      .filter((sessao) => {
        const correspondeBusca =
          !termo ||
          [sessao.filme, sessao.genero, String(sessao.sala)].some((valor) =>
            valor.toLocaleLowerCase('pt-BR').includes(termo),
          );
        const correspondeStatus =
          status === 'todas' ||
          (status === 'disponiveis' ? sessao.disponivel : !sessao.disponivel);

        return correspondeBusca && correspondeStatus;
      })
      .sort((a, b) => `${a.data}T${a.horario}`.localeCompare(`${b.data}T${b.horario}`));
  });

  readonly totalDisponiveis = computed(
    () => this.sessoes().filter((sessao) => sessao.disponivel).length,
  );
  readonly totalIndisponiveis = computed(
    () => this.sessoes().filter((sessao) => !sessao.disponivel).length,
  );
  readonly totalSalas = computed(
    () => new Set(this.sessoes().map((sessao) => sessao.sala)).size,
  );

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
        this.sessoes.set(sessoes);
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro =
          'Não foi possível carregar as sessões. Confira a conexão com o Firebase.';
        this.carregando = false;
      },
    });
  }

  limparFiltros(): void {
    this.busca.set('');
    this.filtroStatus.set('todas');
  }

  excluir(sessao: Sessao): void {
    const confirmou = window.confirm(
      `Deseja realmente excluir a sessão de “${sessao.filme}”?`,
    );

    if (!confirmou) return;

    this.excluindoId = sessao.id;
    this.mensagemErro = '';

    this.sessaoService.delete(sessao.id).subscribe({
      next: () => {
        this.sessoes.update((sessoes) =>
          sessoes.filter(({ id }) => id !== sessao.id),
        );
        this.excluindoId = '';
      },
      error: () => {
        this.mensagemErro = 'Não foi possível excluir a sessão.';
        this.excluindoId = '';
      },
    });
  }
}
