/** Compatible with memory-backed Multer files, without an Express type dependency. */
export interface VoiceUpload {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}
export interface EditVoiceInput {
  name: string;
  files?: VoiceUpload[];
  description?: string;
  labels?: Record<string, string> | string;
  remove_background_noise?: boolean;
}
