import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Sessao } from '../../core/models/sessao.model';
import { mensagemDaFalha, SessaoService } from '../../core/service/sessao.service';

@Component({
  selector: 'app-admin',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private readonly sessaoService = inject(SessaoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  readonly mensagemSucesso = signal('');
  alterandoId = '';

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
          status === 'todas' || (status === 'disponiveis' ? sessao.disponivel : !sessao.disponivel);

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
  readonly totalSalas = computed(() => new Set(this.sessoes().map((sessao) => sessao.sala)).size);

  carregando = true;
  mensagemErro = '';
  excluindoId = '';

  ngOnInit(): void {
    const acao = this.route.snapshot.queryParamMap.get('sucesso');
    if (acao === 'criada') this.mensagemSucesso.set('Sessão cadastrada com sucesso.');
    if (acao === 'atualizada') this.mensagemSucesso.set('Sessão atualizada com sucesso.');
    this.load();
  }

  load(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.sessaoService
      .getAll()
      .pipe(finalize(() => this.cdr.markForCheck()))
      .subscribe({
        next: (sessoes) => {
          this.sessoes.set(sessoes);
          this.carregando = false;
        },
        error: (error: unknown) => {
          this.mensagemErro = mensagemDaFalha(error);
          this.carregando = false;
        },
      });
  }

  limparFiltros(): void {
    this.busca.set('');
    this.filtroStatus.set('todas');
  }

  excluir(sessao: Sessao): void {
    if (this.excluindoId || this.alterandoId) return;
    const confirmou = window.confirm(`Deseja realmente excluir a sessão de “${sessao.filme}”?`);

    if (!confirmou) return;

    this.excluindoId = sessao.id;
    this.mensagemErro = '';
    this.mensagemSucesso.set('');

    this.sessaoService
      .delete(sessao.id)
      .pipe(finalize(() => this.cdr.markForCheck()))
      .subscribe({
        next: () => {
          this.sessoes.update((sessoes) => sessoes.filter(({ id }) => id !== sessao.id));
          this.excluindoId = '';
          this.mensagemSucesso.set('Sessão excluída com sucesso.');
        },
        error: (error: unknown) => {
          this.mensagemErro = mensagemDaFalha(error);
          this.excluindoId = '';
        },
      });
  }
  alternarDisponibilidade(sessao: Sessao): void {
    if (this.alterandoId || this.excluindoId) return;
    this.alterandoId = sessao.id;
    this.mensagemErro = '';
    this.mensagemSucesso.set('');
    const { id, ...dados } = sessao;
    this.sessaoService
      .update(id, { ...dados, disponivel: !dados.disponivel })
      .pipe(
        finalize(() => {
          this.alterandoId = '';
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (atualizada) => {
          this.sessoes.update((sessoes) =>
            sessoes.map((item) => (item.id === id ? atualizada : item)),
          );
          this.mensagemSucesso.set('Disponibilidade atualizada com sucesso.');
        },
        error: (error: unknown) => {
          this.mensagemErro = mensagemDaFalha(error);
        },
      });
  }
}
