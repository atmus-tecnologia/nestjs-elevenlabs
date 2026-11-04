import { Readable } from 'node:stream';
import { VoiceUpload, EditVoiceInput } from './interfaces/upload.interface';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { ApiError } from './interfaces/error.interface';
import { Model } from './interfaces/models.interface';
import { Subscription } from './interfaces/subscription.interface';
import { Settings, Voice, Voices } from './interfaces/voice.interface';
import { ElevenLabsModuleOptions } from './module-options.interface';
import { ELEVENLABS_CONFIG_OPTIONS } from './constants';

@Injectable()
export class ElevenlabsService {
  constructor(
    @Inject(ELEVENLABS_CONFIG_OPTIONS)
    private readonly options: ElevenLabsModuleOptions,
    private readonly httpService: HttpService,
  ) {}

  getVoices(): Observable<AxiosResponse<Voices, ApiError>> {
    return this.httpService.get<Voices>('/voices', {
      headers: {
        'xi-api-key': this.options.apiKey,
      },
    });
  }

  private voiceForm(data: EditVoiceInput): FormData {
    const form = new FormData();
    form.append('name', data.name);
    for (const file of data.files || []) {
      form.append('files', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);
    }
    if (data.description !== undefined) form.append('description', data.description);
    if (data.labels !== undefined) form.append('labels', typeof data.labels === 'string' ? data.labels : JSON.stringify(data.labels));
    if (data.remove_background_noise !== undefined) form.append('remove_background_noise', String(data.remove_background_noise));
    return form;
  }

  addVoice(data: { name: string; files: VoiceUpload[]; description?: string }) {
    return this.httpService.post<{ voice_id: string }>('/voices/add', this.voiceForm(data), {
      headers: { Accept: 'application/json', 'xi-api-key': this.options.apiKey },
    });
  }

  editVoice(voiceID: string, data: EditVoiceInput) {
    return this.httpService.post<{ status: string }>(`/voices/${encodeURIComponent(voiceID)}/edit`, this.voiceForm(data), {
      headers: { 'xi-api-key': this.options.apiKey },
    });
  }

  getDefaultVoiceSettings(): Observable<AxiosResponse<Settings, ApiError>> {
    return this.httpService.get<Settings>('/voices/settings/default', { headers: { 'xi-api-key': this.options.apiKey } });
  }

  getVoiceSettings(
    voiceID: string,
  ): Observable<AxiosResponse<Settings, ApiError>> {
    return this.httpService.get<Settings>(`/voices/${encodeURIComponent(voiceID)}/settings`, {
      headers: {
        'xi-api-key': this.options.apiKey,
      },
    });
  }

  getVoice(voiceID: string): Observable<AxiosResponse<Voice, ApiError>> {
    return this.httpService.get<Voice>(`/voices/${encodeURIComponent(voiceID)}`, {
      headers: {
        'xi-api-key': this.options.apiKey,
      },
    });
  }

  deleteVoice(voiceID: string): Observable<AxiosResponse<any, ApiError>> {
    return this.httpService.delete<any>(`/voices/${encodeURIComponent(voiceID)}`, {
      headers: {
        'xi-api-key': this.options.apiKey,
      },
    });
  }

  editVoiceSettings(
    voiceID: string,
    stability: number,
    similarityBoost: number,
  ): Observable<AxiosResponse<Settings, ApiError>> {
    return this.httpService.post<Settings>(
      `/voices/${encodeURIComponent(voiceID)}/settings/edit`,
      {
        stability,
        similarity_boost: similarityBoost,
      },
      {
        headers: {
          'xi-api-key': this.options.apiKey,
        },
      },
    );
  }

  textToSpeech(
    voiceID: string,
    textInput: string,
    modelId?: string,
    settings?: Partial<Settings>,
  ): Observable<AxiosResponse<Buffer, ApiError>> {
    return this.httpService.post<Buffer>(
      `/text-to-speech/${encodeURIComponent(voiceID)}`,
      {
        text: textInput,
        voice_settings: settings,
        model_id: modelId,
      },
      {
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.options.apiKey,
        },
        responseType: 'arraybuffer',
      },
    );
  }

  textToSpeechStream(
    voiceID: string,
    textInput: string,
    modelId?: string,
    settings?: Partial<Settings>,
  ): Observable<AxiosResponse<Readable, ApiError>> {
    return this.httpService.post<Readable>(
      `/text-to-speech/${encodeURIComponent(voiceID)}/stream`,
      {
        text: textInput,
        voice_settings: settings,
        model_id: modelId,
      },
      {
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.options.apiKey,
        },
        responseType: 'stream',
      },
    );
  }

  getModels(): Observable<AxiosResponse<Model[], ApiError>> {
    return this.httpService.get<Model[]>('/models', {
      headers: {
        Accept: 'application/json',
        'xi-api-key': this.options.apiKey,
      },
    });
  }

  getUserSubscription(): Observable<AxiosResponse<Subscription, ApiError>> {
    return this.httpService.get<Subscription>('/user/subscription', {
      headers: {
        Accept: 'application/json',
        'xi-api-key': this.options.apiKey,
      },
    });
  }
}
