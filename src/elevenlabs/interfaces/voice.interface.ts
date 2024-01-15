export interface Voices {
  voices: Voice[];
}

export interface Voice {
  voice_id: string;
  name: string;
  samples: Sample[];
  category: string;
  fine_tuning: FineTuning;
  labels: Labels;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings?: Settings;
  sharing: Sharing;
}

export interface FineTuning {
  model_id: string;
  language: string;
  is_allowed_to_fine_tune: boolean;
  fine_tuning_requested: boolean;
  finetuning_state: string;
  verification_attempts: VerificationAttempt[];
  verification_failures: string[];
  verification_attempts_count: number;
  slice_ids: string[];
  manual_verification: ManualVerification;
  manual_verification_requested: boolean;
}

export interface ManualVerification {
  extra_text: string;
  request_time_unix: number;
  files: File[];
}

export interface File {
  file_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  upload_date_unix: number;
}

export interface VerificationAttempt {
  text: string;
  date_unix: number;
  accepted: boolean;
  similarity: number;
  levenshtein_distance: number;
  recording: Recording;
}

export interface Recording {
  recording_id: string;
  mime_type: string;
  size_bytes: number;
  upload_date_unix: number;
  transcription: string;
}

export interface Labels {
  additionalProp1: string;
  additionalProp2: string;
  additionalProp3: string;
}

export interface Sample {
  sample_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  hash: string;
}

export interface Settings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface Sharing {
  status: string;
  history_item_sample_id: string;
  enabled_in_library: boolean;
  original_voice_id: string;
  public_owner_id: string;
  liked_by_count: number;
  cloned_by_count: number;
  whitelisted_emails: string[];
}
