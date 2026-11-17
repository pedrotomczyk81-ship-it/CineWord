import '@angular/compiler';
import { createEnvironmentInjector, EnvironmentInjector, Injector, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firebaseConfig } from '../../src/app/core/config/firebase.config';
import { mensagemDaFalha, SessaoService } from '../../src/app/core/service/sessao.service';
import { dataValida, validarSessao } from '../../src/app/core/models/sessao.validation';

const sessao = {
  filme: 'Filme de teste',
  genero: 'Drama',
  classificacaoIndicativa: 12,
  sala: 1,
  data: '2026-11-20',
  horario: '19:00',
  disponivel: true,
};
const base = 'https://cineword-teste-default-rtdb.firebaseio.com/sessoes';

function preparar() {
  firebaseConfig.mode = 'firebase';
  firebaseConfig.databaseURL = 'https://cineword-teste-default-rtdb.firebaseio.com/';
  const injector = createEnvironmentInjector(
    [
      provideHttpClientTesting(),
      { provide: HttpClient, useFactory: () => new HttpClient(inject(HttpBackend)) },
      SessaoService,
    ],
    Injector.NULL as EnvironmentInjector,
  );
  return {
    service: injector.get(SessaoService),
    http: injector.get(HttpTestingController),
    injector,
  };
}

test('validação rejeita datas impossíveis, sala fracionária e classificação inválida', () => {
  assert.equal(dataValida('2026-02-30'), false);
  assert.equal(dataValida('2024-02-29'), true);
  assert.throws(() => validarSessao({ ...sessao, sala: 1.5 }), /inteiro/);
  assert.throws(() => validarSessao({ ...sessao, classificacaoIndicativa: 11 }), /classificação/);
  assert.throws(() => validarSessao({ ...sessao, filme: '   ' }), /título/);
  assert.throws(() => validarSessao({ ...sessao, horario: '25:00' }), /horário/);
});

test('GET converte chaves Firebase em IDs e aceita banco vazio', async () => {
  const { service, http, injector } = preparar();
  const lista = firstValueFrom(service.getAll());
  http.expectOne(base + '.json').flush({ abc: { ...sessao, id: 'id-forjado' } });
  assert.deepEqual(await lista, [{ ...sessao, id: 'abc' }]);
  const vazio = firstValueFrom(service.getAll());
  http.expectOne(base + '.json').flush(null);
  assert.deepEqual(await vazio, []);
  http.verify();
  injector.destroy();
});

test('GET individual informa ausência e não aceita caminho arbitrário', async () => {
  const { service, http, injector } = preparar();
  const ausente = firstValueFrom(service.getById('ausente'));
  http.expectOne(base + '/ausente.json').flush(null);
  await assert.rejects(ausente, /não encontrada/);
  await assert.rejects(firstValueFrom(service.getById('../outro')), /inválido/);
  http.verify();
  injector.destroy();
});

test('POST valida, confere conflitos e retorna ID gerado pelo Firebase', async () => {
  const { service, http, injector } = preparar();
  const criada = firstValueFrom(service.create({ ...sessao, filme: '  Filme de teste  ' }));
  http.expectOne(base + '.json').flush(null);
  const request = http.expectOne(base + '.json');
  assert.equal(request.request.method, 'POST');
  assert.deepEqual(request.request.body, sessao);
  request.flush({ name: 'nova' });
  assert.deepEqual(await criada, { ...sessao, id: 'nova' });
  http.verify();
  injector.destroy();
});

test('conflito interrompe gravação remota', async () => {
  const { service, http, injector } = preparar();
  const criada = firstValueFrom(service.create(sessao));
  http.expectOne(base + '.json').flush({ existente: sessao });
  await assert.rejects(criada, /Já existe uma sessão/);
  http.expectNone(base + '.json');
  http.verify();
  injector.destroy();
});

test('PUT edita a própria sessão sem criar conflito consigo mesma', async () => {
  const { service, http, injector } = preparar();
  const atualizada = firstValueFrom(service.update('abc', { ...sessao, disponivel: false }));
  http.expectOne(base + '.json').flush({ abc: sessao });
  const request = http.expectOne(base + '/abc.json');
  assert.equal(request.request.method, 'PUT');
  request.flush({ ...sessao, disponivel: false });
  assert.deepEqual(await atualizada, { ...sessao, id: 'abc', disponivel: false });
  http.verify();
  injector.destroy();
});

test('DELETE usa o registro solicitado e permissão negada continua como erro', async () => {
  const { service, http, injector } = preparar();
  const excluida = firstValueFrom(service.delete('abc'));
  const request = http.expectOne(base + '/abc.json');
  assert.equal(request.request.method, 'DELETE');
  request.flush(null);
  await excluida;
  const negada = firstValueFrom(service.getAll());
  http
    .expectOne(base + '.json')
    .flush({ error: 'Permission denied' }, { status: 401, statusText: 'Unauthorized' });
  await assert.rejects(negada, (error) => mensagemDaFalha(error).includes('negou o acesso'));
  http.verify();
  injector.destroy();
});

test('modo Firebase sem configuração falha, sem alternar para dados locais', async () => {
  const { service, http, injector } = preparar();
  firebaseConfig.databaseURL = '';
  await assert.rejects(firstValueFrom(service.getAll()), /URL do Firebase/);
  http.verify();
  injector.destroy();
});
