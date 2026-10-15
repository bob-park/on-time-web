import assert from 'node:assert/strict';
import test from 'node:test';

import { matchesDrafter, matchesLabel, parsePaletteQuery } from './paletteQuery.ts';

void test('parsePaletteQuery splits type and name', () => {
  assert.deepEqual(parsePaletteQuery('홍길동 연장'), { type: 'OVERTIME_WORK', nameTokens: ['홍길동'] });
  assert.deepEqual(parsePaletteQuery('휴가'), { type: 'VACATION', nameTokens: [] });
  assert.deepEqual(parsePaletteQuery('Kim'), { type: undefined, nameTokens: ['kim'] });
});

void test('first type keyword wins, later ones dropped', () => {
  assert.deepEqual(parsePaletteQuery('휴가 휴일 홍'), { type: 'VACATION', nameTokens: ['홍'] });
});

void test('blank input yields nothing', () => {
  assert.deepEqual(parsePaletteQuery('   '), { type: undefined, nameTokens: [] });
});

void test('matchesDrafter', () => {
  assert.equal(matchesDrafter('홍길동', []), true);
  assert.equal(matchesDrafter('홍길동', ['길동']), true);
  assert.equal(matchesDrafter('Kim Minsu', ['kim', 'min']), true);
  assert.equal(matchesDrafter('홍길동', ['김']), false);
  assert.equal(matchesDrafter(undefined, ['홍']), false);
});

void test('matchesLabel', () => {
  assert.equal(matchesLabel('휴가 사용 내역', '휴가'), true);
  assert.equal(matchesLabel('근무 일정', ''), false);
});
