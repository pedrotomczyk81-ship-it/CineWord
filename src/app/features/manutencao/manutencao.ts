import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Sessao } from '../../core/models/sessao.model';
import { mensagemDaFalha, SessaoService } from '../../core/service/sessao.service';
import { CLASSIFICACOES, dataValida, GENEROS } from '../../core/models/sessao.validation';

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
  private readonly cdr = inject(ChangeDetectorRef);

  readonly form = this.formBuilder.nonNullable.group({
    filme: [
      '',
      [
        Validators.required,
        (control: AbstractControl) => {
          const value = String(control.value ?? '').trim();
          return value.length >= 2 && value.length <= 120 ? null : { titulo: true };
        },
      ],
    ],
    genero: [
      '',
      [
        Validators.required,
        (control: AbstractControl) => (GENEROS.includes(control.value) ? null : { genero: true }),
      ],
    ],
    classificacaoIndicativa: [
      0,
      [
        Validators.required,
        (control: AbstractControl) =>
          CLASSIFICACOES.includes(control.value) ? null : { classificacao: true },
      ],
    ],
    sala: [
      1,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(99),
        (control: AbstractControl) => (Number.isInteger(control.value) ? null : { inteiro: true }),
      ],
    ],
    data: [
      '',
      [
        Validators.required,
        (control: AbstractControl) => (dataValida(String(control.value)) ? null : { data: true }),
      ],
    ],
    horario: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)]],
    disponivel: [true],
  });

  id = '';
  carregando = false;
  enviando = false;
  mensagemErro = '';
  falhaCarregamento = false;

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
    this.falhaCarregamento = false;
    this.mensagemErro = '';
    this.form.disable();

    this.sessaoService
      .getById(this.id)
      .pipe(finalize(() => this.cdr.markForCheck()))
      .subscribe({
        next: ({ id: _id, ...sessao }) => {
          this.form.setValue(sessao);
          this.form.enable();
          this.carregando = false;
        },
        error: (error: unknown) => {
          this.mensagemErro = mensagemDaFalha(error);
          this.falhaCarregamento = true;
          this.carregando = false;
        },
      });
  }

  submit(): void {
    if (this.enviando || this.carregando || this.falhaCarregamento || this.form.disabled) return;
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

    request.pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: () =>
        void this.router.navigate(['/admin'], {
          queryParams: { sucesso: this.editando ? 'atualizada' : 'criada' },
        }),
      error: (error: unknown) => {
        this.mensagemErro = mensagemDaFalha(error);
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
