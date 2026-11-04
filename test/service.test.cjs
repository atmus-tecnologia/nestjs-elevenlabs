require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { once } = require('node:events');
const { Test } = require('@nestjs/testing');
const { HttpService } = require('@nestjs/axios');
const { firstValueFrom } = require('rxjs');
const { ElevenlabsModule, ElevenlabsService } = require('../dist');

test('sync/async DI, multipart files, audio buffers, streams and HTTP errors', async t => {
  const requests = [];
  const server = createServer(async (req, res) => {
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    requests.push({ url: req.url, headers: req.headers, body: Buffer.concat(chunks).toString() });
    if (req.url === '/models') { res.statusCode = 401; res.end('unauthorized'); return; }
    if (req.url.includes('/text-to-speech/')) { res.setHeader('Content-Type', 'audio/mpeg'); res.end(Buffer.from([0, 1, 255])); return; }
    res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ voice_id: 'voice_test', status: 'ok', tier: 'test' }));
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  for (const definition of [
    ElevenlabsModule.register({ apiKey: 'test-key' }),
    ElevenlabsModule.registerAsync({ useFactory: async () => ({ apiKey: 'test-key' }) }),
  ]) {
    const context = await Test.createTestingModule({ imports: [definition] }).compile();
    try {
      const http = context.get(HttpService);
      assert.equal(http.axiosRef.defaults.baseURL, 'https://api.elevenlabs.io/v1');
      assert.equal(http.axiosRef.defaults.timeout, 30000);
      http.axiosRef.defaults.baseURL = `http://127.0.0.1:${server.address().port}`;
      const service = context.get(ElevenlabsService);
      const data = { name: 'Voice', description: 'Test', files: [{ buffer: Buffer.from('audio-sample'), mimetype: 'audio/mpeg', originalname: 'sample.mp3' }] };
      assert.equal((await firstValueFrom(service.addVoice(data))).data.voice_id, 'voice_test');
      assert.match(requests.at(-1).headers['content-type'], /multipart\/form-data; boundary=/);
      assert.match(requests.at(-1).body, /audio-sample/);
      assert.match(requests.at(-1).body, /filename="sample.mp3"/);
      await firstValueFrom(service.editVoice('id/with space', data));
      assert.equal(requests.at(-1).url, '/voices/id%2Fwith%20space/edit');
      assert.equal(data.files[0].originalname, 'sample.mp3');
      const audio = await firstValueFrom(service.textToSpeech('voice', 'Hello'));
      assert.deepEqual(audio.data, Buffer.from([0, 1, 255]));
      const stream = (await firstValueFrom(service.textToSpeechStream('voice', 'Hello'))).data;
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      assert.deepEqual(Buffer.concat(chunks), Buffer.from([0, 1, 255]));
      assert.equal((await firstValueFrom(service.getUserSubscription())).data.tier, 'test');
      await assert.rejects(() => firstValueFrom(service.getModels()), error => error.response.status === 401);
      assert(requests.every(request => request.headers['xi-api-key'] === 'test-key'));
    } finally { await context.close(); }
  }
  assert.throws(() => ElevenlabsModule.registerAsync({}), /requires useFactory/);
});
