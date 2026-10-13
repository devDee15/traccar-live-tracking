import test from 'node:test';
import assert from 'node:assert/strict';

import { rawTraccarPositionSchema } from './location-event.js';

test('rejects raw Traccar packets that are marked invalid', () => {
  const raw = {
    device: { id: 1, uniqueId: '869925075483279' },
    position: {
      id: 0,
      latitude: 0,
      longitude: 0,
      speed: 0,
      course: 0,
      valid: false,
      fixTime: '2026-10-10T10:50:50.115Z',
    },
  };

  assert.throws(() => rawTraccarPositionSchema.parse(raw), /valid/i);
});

test('accepts a valid GPS position packet', () => {
  const raw = {
    device: { id: 1, uniqueId: '869925075483279' },
    position: {
      id: 123,
      latitude: 29.96343,
      longitude: 77.54593,
      speed: 0,
      course: 0,
      valid: true,
      fixTime: '2026-10-10T10:54:56.618Z',
    },
  };

  const parsed = rawTraccarPositionSchema.parse(raw);
  assert.equal(parsed.device.uniqueId, '869925075483279');
  assert.equal(parsed.position.latitude, 29.96343);
  assert.equal(parsed.position.longitude, 77.54593);
});
