import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';
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

  /**
   * Function that returns an object containing the details for all the voices.
   * @returns {Voices} - An object containing the list of voices and their details.
   */
  getVoices(): Observable<AxiosResponse<Voices, ApiError>> {
    return this.httpService.get<Voices>('/voices', {
      headers: {
        'xi-api-key': this.options.apiKey,
      },
    });
  }

  private base64toBlob(base64Data: string, contentType = '') {
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  /**
   * The `addVoice` function takes in data including a name, files, and description, and sends a POST
   * request to add a voice with the provided data.
   * @param data - {
   * @returns a Promise that resolves to an HTTP response.
   */
  addVoice(data: {
    name: string;
    files: Express.Multer.File[];
    description: string;
  }) {
    const form = new FormData();
    form.append('name', data.name);
    data.files.forEach(async (file: Express.Multer.File) => {
      const base = Buffer.from(file.buffer).toString('base64');
      form.append(
        'files',
        this.base64toBlob(base, file.mimetype),
        file.originalname,
      );
    });
    form.append('description', data.description);
    return this.httpService.post<any>('/voices/add', form, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        'xi-api-key': this.options.apiKey,
      },
    });
  }

  /**
   * The `editVoice` function sends a POST request to edit a voice with the specified voice ID, using
   * the provided data and headers.
   * @param {string} voiceID - The voiceID parameter is a string that represents the ID of the voice
   * that needs to be edited. It is used to identify the specific voice in the API endpoint.
   * @param {any} data - The `data` parameter is an object that contains the data to be sent in the
   * HTTP request. It is of type `any`, which means it can be any type of data.
   * @returns an HTTP POST request to edit a voice with the specified voice ID. The response from the
   * request is of type `any`.
   */
  editVoice(voiceID: string, data: any) {
    delete data.voice_id;
    return this.httpService.post<any>(`/voices/${voiceID}/edit`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'xi-api-key': this.options.apiKey,
      },
    });
  }

  /**
   * Function that returns an object containing the default settings for the voices.
   * @returns {Settings} - An object containing the default settings for the voices.
   */
  getDefaultVoiceSettings(): Observable<AxiosResponse<Settings, ApiError>> {
    return this.httpService.get<Settings>('/voices/settings/default');
  }

  /**
   * Function that returns an object containing the settings of the specified voice.
   * @param {string} voiceID - The ID of the voice to use for the text-to-speech conversion.
   * @returns {Settings} - An object containing the settings of the specified voice.
   */
  getVoiceSettings(
    voiceID: string,
  ): Observable<AxiosResponse<Settings, ApiError>> {
    return this.httpService.get<Settings>(`/voices/${voiceID}/settings`, {
      headers: {
        'xi-api-key': this.options.apiKey,
      },
    });
  }

  /**
   * Function that returns an object containing the details of the specified voice.
   * @param {string} voiceID - The ID of the voice to use for the text-to-speech conversion.
   * @returns {Voice} - An object containing the details of the specified voice.
   */
  getVoice(voiceID: string): Observable<AxiosResponse<Voice, ApiError>> {
    return this.httpService.get<Voice>(`/voices/${voiceID}`, {
      headers: {
        'xi-api-key': this.options.apiKey,
      },
    });
  }

  /**
   * Function that returns an object containing the status of the delete operation.
   * @param {string} voiceID - The ID of the voice to use for the text-to-speech conversion.
   * @returns {Object} - An object containing the status of the delete operation.
   */
  deleteVoice(voiceID: string): Observable<AxiosResponse<any, ApiError>> {
    return this.httpService.delete<any>(`/voices/${voiceID}`, {
      headers: {
        'xi-api-key': this.options.apiKey,
      },
    });
  }

  /**
   * Function that returns an object containing the status of the edit operation.
   * @param {string} voiceID - The ID of the voice to use for the text-to-speech conversion.
   * @param {number} stability - The stability setting for the voice.
   * @param {number} similarityBoost - The similarity boost setting for the voice.
   * @returns {Settings} - An object containing the status of the edit operation.
   */
  editVoiceSettings(
    voiceID: string,
    stability: number,
    similarityBoost: number,
  ): Observable<AxiosResponse<Settings, ApiError>> {
    return this.httpService.post<Settings>(
      `/voices/${voiceID}/settings/edit`,
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

  /**
   * Function that converts text to speech and saves the audio file to the specified file name.
   * @param {string} voiceID - The ID of the voice to use for the text-to-speech conversion.
   * @param {string} fileName - The name of the file to save the audio data to.
   * @param {string} textInput - The text to convert to speech.
   * @param {string} modelId - The model to use for the text-to-speech conversion. If null, it will use elevenlab's default model.
   * @param {Settings} settings - The settings to use for the text-to-speech conversion.
   * @returns {Object} - An object containing the status of the operation.
   */
  textToSpeech(
    voiceID: string,
    textInput: string,
    modelId?: string,
    settings?: Partial<Settings>,
  ): Observable<AxiosResponse<any, ApiError>> {
    return this.httpService.post<any>(
      `/text-to-speech/${voiceID}`,
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

  /**
   * Function that converts text to speech and returns a readable stream of the audio data.
   * @param {string} voiceID - The ID of the voice to use for the text-to-speech conversion.
   * @param {string} textInput - The text to convert to speech.
   * @param {string} modelId - The model to use for the text-to-speech conversion. If null, it will use elevenlab's default model.
   * @param {Settings} settings - The settings to use for the text-to-speech conversion.
   * @returns {Object} - A readable stream of the audio data.
   */
  textToSpeechStream(
    voiceID: string,
    textInput: string,
    modelId?: string,
    settings?: Partial<Settings>,
  ): Observable<AxiosResponse<any, ApiError>> {
    return this.httpService.post<any>(
      `/text-to-speech/${voiceID}/stream`,
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

  /**
   * The function `getModels()` returns an Observable that makes an HTTP GET request to retrieve a list
   * of models from the server.
   * @returns The function `getModels()` returns an Observable that emits an AxiosResponse object
   * containing an array of Model objects and an ApiError object.
   */
  getModels(): Observable<AxiosResponse<any[], ApiError>> {
    return this.httpService.get<Model[]>('/models', {
      headers: {
        Accept: 'application/json',
        'xi-api-key': this.options.apiKey,
      },
    });
  }

  /**
   * The function `getUserSubscription` returns an Observable that makes an HTTP GET request to
   * retrieve a user's subscription data.
   * @returns The function `getUserSubscription()` returns an Observable of type
   * `AxiosResponse<Subscription[], ApiError>`.
   */
  getUserSubscription(): Observable<AxiosResponse<Subscription[], ApiError>> {
    return this.httpService.get<Subscription[]>('/user/subscription', {
      headers: {
        Accept: 'application/json',
        'xi-api-key': this.options.apiKey,
      },
    });
  }
}
