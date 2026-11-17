import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Sessao } from '../../core/models/sessao.model';
import { mensagemDaFalha, SessaoService } from '../../core/service/sessao.service';
import { SessaoCard } from '../../shared/components/sessao-card/sessao-card';

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, SessaoCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly service = inject(SessaoService);
  readonly programacao = inject(ActivatedRoute).snapshot.data['programacao'] === true;
  readonly sessoes = signal<Sessao[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal('');
  readonly busca = signal('');
  readonly genero = signal('');
  readonly data = signal('');
  readonly status = signal('todas');
  readonly generos = computed(() => [...new Set(this.sessoes().map((s) => s.genero))].sort());
  readonly filtradas = computed(() => {
    const termo = this.busca().trim().toLocaleLowerCase('pt-BR');
    return this.sessoes()
      .filter(
        (s) =>
          (!termo || s.filme.toLocaleLowerCase('pt-BR').includes(termo)) &&
          (!this.genero() || s.genero === this.genero()) &&
          (!this.data() || s.data === this.data()) &&
          (this.status() === 'todas' || s.disponivel === (this.status() === 'disponiveis')),
      )
      .sort((a, b) => `${a.data}T${a.horario}`.localeCompare(`${b.data}T${b.horario}`));
  });
  readonly visiveis = computed(() =>
    this.programacao ? this.filtradas() : this.filtradas().slice(0, 6),
  );
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.service.getAll().subscribe({
      next: (sessoes) => {
        this.sessoes.set(sessoes);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDaFalha(erro));
        this.carregando.set(false);
      },
    });
  }
  limpar(): void {
    this.busca.set('');
    this.genero.set('');
    this.data.set('');
    this.status.set('todas');
  }
}
