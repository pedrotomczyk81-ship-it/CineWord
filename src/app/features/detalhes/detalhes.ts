import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Sessao } from '../../core/models/sessao.model';
import { mensagemDaFalha, SessaoService } from '../../core/service/sessao.service';
import { SessaoCard } from '../../shared/components/sessao-card/sessao-card';

@Component({
  selector: 'app-detalhes',
  imports: [DatePipe, RouterLink, SessaoCard],
  templateUrl: './detalhes.html',
  styleUrl: './detalhes.css',
})
export class Detalhes implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(SessaoService);
  readonly sessao = signal<Sessao | null>(null);
  readonly erro = signal('');
  readonly carregando = signal(true);
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.service.getById(this.route.snapshot.paramMap.get('id') ?? '').subscribe({
      next: (sessao) => {
        this.sessao.set(sessao);
        this.carregando.set(false);
      },
      error: (error) => {
        this.erro.set(mensagemDaFalha(error));
        this.carregando.set(false);
      },
    });
  }
}
