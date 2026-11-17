import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, map, Observable, of, switchMap } from 'rxjs';
import { firebaseConfig } from '../config/firebase.config';
import { criarSessoesExemplo } from '../data/sessoes-exemplo';
import { Sessao } from '../models/sessao.model';
import { validarSessao } from '../models/sessao.validation';

@Injectable({ providedIn: 'root' })
export class SessaoService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'cineword.sessoes.v1';
  readonly modoLocal = firebaseConfig.mode === 'local';

  private get apiUrl(): string {
    const base = firebaseConfig.databaseURL.trim().replace(/\/+$/, '');
    if (!base) throw new Error('A URL do Firebase ainda não foi configurada.');
    const url = new URL(base);
    if (
      url.protocol !== 'https:' ||
      !/^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(firebaseio\.com|firebasedatabase\.app)$/.test(
        url.hostname,
      ) ||
      url.pathname !== '/' ||
      url.search ||
      url.hash ||
      url.username ||
      url.password ||
      url.port
    )
      throw new Error('Configure a URL raiz HTTPS do Realtime Database.');
    return `${base}/sessoes`;
  }

  getAll(): Observable<Sessao[]> {
    return defer(() =>
      this.modoLocal
        ? of(this.lerLocal())
        : this.http
            .get<Record<string, Omit<Sessao, 'id'>> | null>(`${this.apiUrl}.json`)
            .pipe(
              map((response) =>
                Object.entries(response ?? {}).map(([id, value]) => ({
                  ...validarSessao(value),
                  id,
                })),
              ),
            ),
    );
  }

  getById(id: string): Observable<Sessao> {
    return defer(() => {
      this.validarId(id);
      return this.modoLocal
        ? of(this.encontrar(this.lerLocal(), id))
        : this.http.get<Omit<Sessao, 'id'> | null>(`${this.apiUrl}/${id}.json`).pipe(
            map((value) => {
              if (!value) throw new Error('Sessão não encontrada.');
              return { ...validarSessao(value), id };
            }),
          );
    });
  }

  create(value: Omit<Sessao, 'id'>): Observable<Sessao> {
    return defer(() => {
      const sessao = validarSessao(value);
      return this.getAll().pipe(
        switchMap((sessoes) => {
          this.verificarConflito(sessoes, sessao);
          if (this.modoLocal) {
            const nova = { ...sessao, id: crypto.randomUUID() };
            this.salvarLocal([...sessoes, nova]);
            return of(nova);
          }
          return this.http
            .post<{ name: string }>(`${this.apiUrl}.json`, sessao)
            .pipe(map((response) => ({ ...sessao, id: response.name })));
        }),
      );
    });
  }

  update(id: string, value: Omit<Sessao, 'id'>): Observable<Sessao> {
    return defer(() => {
      this.validarId(id);
      const sessao = validarSessao(value);
      return this.getAll().pipe(
        switchMap((sessoes) => {
          this.encontrar(sessoes, id);
          this.verificarConflito(sessoes, sessao, id);
          const atualizada = { ...sessao, id };
          if (this.modoLocal) {
            this.salvarLocal(sessoes.map((item) => (item.id === id ? atualizada : item)));
            return of(atualizada);
          }
          return this.http.put(`${this.apiUrl}/${id}.json`, sessao).pipe(map(() => atualizada));
        }),
      );
    });
  }

  delete(id: string): Observable<void> {
    return defer(() => {
      this.validarId(id);
      if (!this.modoLocal) return this.http.delete<void>(`${this.apiUrl}/${id}.json`);
      const sessoes = this.lerLocal();
      this.encontrar(sessoes, id);
      this.salvarLocal(sessoes.filter((item) => item.id !== id));
      return of(undefined);
    });
  }

  private lerLocal(): Sessao[] {
    let json: string | null;
    try {
      json = localStorage.getItem(this.storageKey);
    } catch {
      throw new Error(
        'O navegador bloqueou o armazenamento local. Libere-o para usar o modo local.',
      );
    }
    if (json === null) {
      const exemplos = criarSessoesExemplo();
      this.salvarLocal(exemplos);
      return exemplos;
    }
    try {
      const dados: unknown = JSON.parse(json);
      if (!Array.isArray(dados)) throw new Error();
      const ids = new Set<string>();
      return dados.map((item: Sessao) => {
        this.validarId(item.id);
        if (ids.has(item.id)) throw new Error();
        ids.add(item.id);
        return { ...validarSessao(item), id: item.id };
      });
    } catch {
      throw new Error(
        'Os dados locais estão inválidos. Seus registros foram preservados; use outro navegador para demonstrar ou restaure um backup.',
      );
    }
  }

  private salvarLocal(sessoes: Sessao[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(sessoes));
    } catch {
      throw new Error(
        'Não foi possível salvar no navegador. Verifique o espaço e as permissões de armazenamento.',
      );
    }
  }

  private validarId(id: string): void {
    if (!id || /[.#$\[\]\/\u0000-\u001f\u007f]/.test(id))
      throw new Error('Identificador de sessão inválido.');
  }

  private encontrar(sessoes: Sessao[], id: string): Sessao {
    const sessao = sessoes.find((item) => item.id === id);
    if (!sessao) throw new Error('Sessão não encontrada.');
    return sessao;
  }

  private verificarConflito(sessoes: Sessao[], sessao: Omit<Sessao, 'id'>, id = ''): void {
    if (
      sessoes.some(
        (item) =>
          item.id !== id &&
          item.sala === sessao.sala &&
          item.data === sessao.data &&
          item.horario === sessao.horario,
      )
    )
      throw new Error(
        'Já existe uma sessão nesta sala, data e horário. Escolha outro horário ou sala.',
      );
  }
}

export function mensagemDaFalha(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401 || error.status === 403)
      return 'O Firebase negou o acesso. Confira a autenticação e as regras do banco.';
    return 'Não foi possível acessar o Firebase. Confira a conexão e tente novamente.';
  }
  return error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação. Tente novamente.';
}
