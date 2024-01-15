import { ModuleMetadata } from '@nestjs/common';

export type ElevenLabsModuleOptions = {
  apiKey: string;
};

export interface ElevenLabsModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<ElevenLabsModuleOptions> | ElevenLabsModuleOptions;
  inject?: any[];
}
