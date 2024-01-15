import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ElevenlabsService } from './elevenlabs.service';
import { ElevenLabsModuleAsyncOptions, ElevenLabsModuleOptions } from './module-options.interface';
import { ELEVENLABS_CONFIG_OPTIONS } from './constants';

@Module({})
export class ElevenlabsModule {
  static register(options: ElevenLabsModuleOptions): DynamicModule {
    return {
      module: ElevenlabsModule,
      imports: [
        HttpModule.register({
          baseURL: 'https://api.elevenlabs.io/v1',
        }),
      ],
      providers: [
        {
          provide: ELEVENLABS_CONFIG_OPTIONS,
          useValue: options,
        },
        ElevenlabsService,
      ],
      exports: [ElevenlabsService],
    };
  }

  static registerAsync(options: ElevenLabsModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: ElevenlabsModule,
      imports: options.imports || [],
      providers: [...asyncProviders, ElevenlabsService],
      exports: [ElevenlabsService],
    };
  }

  private static createAsyncProviders(options: ElevenLabsModuleAsyncOptions): Provider[] {
    return [
      {
        provide: ELEVENLABS_CONFIG_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
    ];
  }
}
