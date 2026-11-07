import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Sessao } from '../../core/models/sessao.model';
import { SessaoService } from '../../core/service/sessao.service';

@Component({
  selector: 'app-manutencao',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './manutencao.html',
  styleUrl: './manutencao.css',
})
export class Manutencao implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessaoService = inject(SessaoService);

  readonly form = this.formBuilder.nonNullable.group({
    filme: ['', [Validators.required, Validators.minLength(2)]],
    genero: ['', Validators.required],
    classificacaoIndicativa: [0, [Validators.required, Validators.min(0), Validators.max(18)]],
    sala: [1, [Validators.required, Validators.min(1)]],
    data: ['', Validators.required],
    horario: ['', Validators.required],
    disponivel: [true],
  });

  id = '';
  carregando = false;
  enviando = false;
  mensagemErro = '';

  get editando(): boolean {
    return Boolean(this.id);
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.editando) {
      this.load();
    }
  }

  load(): void {
    this.carregando = true;
    this.mensagemErro = '';
    this.form.disable();

    this.sessaoService.getById(this.id).subscribe({
      next: ({ id: _id, ...sessao }) => {
        this.form.setValue(sessao);
        this.form.enable();
        this.carregando = false;
      },
      error: () => {
        this.mensagemErro = 'Não foi possível carregar a sessão solicitada.';
        this.carregando = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.mensagemErro = '';
    this.form.disable();

    const sessao: Omit<Sessao, 'id'> = this.form.getRawValue();
    const request = this.editando
      ? this.sessaoService.update(this.id, sessao)
      : this.sessaoService.create(sessao);

    request.subscribe({
      next: () => void this.router.navigate(['/admin']),
      error: () => {
        this.mensagemErro = `Não foi possível ${this.editando ? 'atualizar' : 'cadastrar'} a sessão.`;
        this.enviando = false;
        this.form.enable();
      },
    });
  }

  campoInvalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }
}
