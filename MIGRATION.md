# Migrating from 0.1.0 to 1.0.0

This is a breaking release. Upgrade Node.js to 22.12+ and NestJS to 11 or 12 before installing it. Keep @nestjs/common and @nestjs/core on the same major. CommonJS consumers can load the package on supported Node releases; ESM consumers can use named imports. TypeScript consumers should use a modern NodeNext or Node20 module configuration compatible with require(esm) when consuming NestJS 12.

All existing method names remain. `registerAsync` requires a factory and now correctly imports HttpModule. Requests have a 30-second timeout.

`getUserSubscription()` returns `AxiosResponse<Subscription>` instead of an array. `textToSpeech()` returns audio data as Buffer; `textToSpeechStream()` returns a Node Readable. HTTP calls remain RxJS Observables; use `firstValueFrom` or subscribe to execute them.

`editVoice(id, data)` requires a name and builds multipart form data; it no longer deletes `voice_id` on the caller's object. Supported fields are name, files, description, labels and remove_background_noise. `addVoice` accepts memory-backed files with buffer, mimetype and originalname through the exported VoiceUpload type; Express/Multer types are no longer required.

The package covers the documented voice, model, subscription and TTS helpers, not the full ElevenLabs API. Review the [voice-edit contract](https://elevenlabs.io/docs/api-reference/voices/update) when migrating old untyped payloads.

Run your application's integration tests before rollout. This repository's tests use offline transports; they do not establish live-provider or production behavior.
