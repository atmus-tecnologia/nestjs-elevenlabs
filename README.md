# @atmus/nestjs-elevenlabs

NestJS HTTP helpers for ElevenLabs voices, text-to-speech audio, streaming, models and subscription information.

## Installation

```sh
npm install @atmus/nestjs-elevenlabs @nestjs/common reflect-metadata rxjs
```

Use the same Nest major as your application. Upgrading from a previous release? Read [MIGRATION.md](MIGRATION.md) first.

## Configuration

```ts
import { Module } from '@nestjs/common';
import { ElevenlabsModule } from '@atmus/nestjs-elevenlabs';

@Module({
  imports: [ElevenlabsModule.register({ apiKey: process.env.ELEVENLABS_API_KEY! })],
})
export class AppModule {}
```

Load ELEVENLABS_API_KEY before registering the module. Never commit API keys or passwords.
For asynchronous configuration:

```ts
ElevenlabsModule.registerAsync({
  useFactory: async () => ({ apiKey: process.env.ELEVENLABS_API_KEY! }),
})
```

`registerAsync` requires `useFactory`; `imports` and `inject` let you use your own configuration providers.

## Usage and API

```ts
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ElevenlabsService } from '@atmus/nestjs-elevenlabs';

@Injectable()
export class SpeechService {
  constructor(private readonly elevenlabs: ElevenlabsService) {}

  async speak(voiceId: string, text: string) {
    const response = await firstValueFrom(
      this.elevenlabs.textToSpeech(voiceId, text),
    );
    return response.data; // Buffer containing audio/mpeg
  }
}
```

All HTTP helpers return RxJS Observables of AxiosResponse. Subscribe or use firstValueFrom to execute requests. Axios errors propagate; inspect error.response for provider status/details. Requests use the ElevenLabs v1 API and a 30-second timeout.

| Method | Response data |
| --- | --- |
| getVoices() / getVoice(id) | Voices / Voice |
| getDefaultVoiceSettings() / getVoiceSettings(id) | Settings |
| addVoice({ name, files, description? }) | { voice_id } |
| editVoice(id, { name, files?, description?, labels?, remove_background_noise? }) | { status } |
| deleteVoice(id) | Provider deletion response |
| editVoiceSettings(id, stability, similarityBoost) | Settings |
| textToSpeech(id, text, modelId?, settings?) | Buffer |
| textToSpeechStream(id, text, modelId?, settings?) | Node Readable |
| getModels() | Model[] |
| getUserSubscription() | Subscription object |

Upload files use the exported VoiceUpload shape: `{ buffer: Buffer, mimetype: string, originalname: string }`. Memory-backed Multer files are compatible. Multipart boundaries are generated automatically. Use only voices and source recordings you are authorized to use. TTS calls can incur provider charges; no model is forced by this module.

Public exports include ElevenlabsModule, ElevenlabsService, ElevenLabsModuleOptions, ElevenLabsModuleAsyncOptions, VoiceUpload, EditVoiceInput and response interfaces. This is a focused wrapper, not the complete ElevenLabs SDK.


## Compatibility and development

Requires **Node.js 22.12+**, **NestJS 11 or 12**, RxJS 7.8+ and reflect-metadata 0.2.2+.
The package ships CommonJS JavaScript, TypeScript declarations and source maps. Modern Node supports loading NestJS 12's ESM dependencies; use a compatible NodeNext/Node20 TypeScript configuration in consuming applications.

```sh
npm ci
npm run check
```

Checks include offline regression tests and installation of the actual npm archive in an isolated consumer. CI covers Node 22/24 and Nest 11/12. No real API credentials are used by the test suite. Live provider behavior must be validated in your application.

See [CHANGELOG.md](CHANGELOG.md), [MIGRATION.md](MIGRATION.md) and [CONTRIBUTING.md](CONTRIBUTING.md) for release history, breaking changes and publication instructions. Licensed under [MIT](LICENSE).
