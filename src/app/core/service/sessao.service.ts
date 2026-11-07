import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Sessao } from '../models/sessao.model';

@Injectable({
  providedIn: 'root',
})
export class SessaoService {
  private readonly http = inject(HttpClient);

  // Substitua pela URL do seu projeto no Firebase Realtime Database.
  private readonly apiUrl =
    'https://SEU-PROJETO-default-rtdb.firebaseio.com/sessoes';
  private readonly sufix = '.json';

  getAll(): Observable<Sessao[]> {
    return this.http
      .get<Record<string, Omit<Sessao, 'id'>> | null>(
        this.apiUrl + this.sufix,
      )
      .pipe(
        map((response) =>
          Object.entries(response ?? {}).map(([id, sessao]) => ({
            id,
            ...sessao,
          })),
        ),
      );
  }

  getById(id: string): Observable<Sessao> {
    return this.http
      .get<Omit<Sessao, 'id'> | null>(
        `${this.apiUrl}/${id}${this.sufix}`,
      )
      .pipe(
        map((response) => {
          if (!response) {
            throw new Error('Sessão não encontrada.');
          }

          return { id, ...response };
        }),
      );
  }

  create(sessao: Omit<Sessao, 'id'>): Observable<Sessao> {
    return this.http
      .post<{ name: string }>(this.apiUrl + this.sufix, sessao)
      .pipe(
        map((response) => ({
          id: response.name,
          ...sessao,
        })),
      );
  }

  update(id: string, sessao: Omit<Sessao, 'id'>): Observable<Sessao> {
    return this.http
      .put<Omit<Sessao, 'id'>>(
        `${this.apiUrl}/${id}${this.sufix}`,
        sessao,
      )
      .pipe(
        map(() => ({
          id,
          ...sessao,
        })),
      );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}${this.sufix}`,
    );
  }
}
