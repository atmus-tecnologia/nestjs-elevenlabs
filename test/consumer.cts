import { ElevenlabsModule, type ElevenLabsModuleOptions, type VoiceUpload } from '@atmus/nestjs-elevenlabs';
const options: ElevenLabsModuleOptions = { apiKey: 'test-key' };
ElevenlabsModule.register(options);
const file: VoiceUpload = { buffer: Buffer.from('test'), mimetype: 'audio/mpeg', originalname: 'test.mp3' };
void file;
