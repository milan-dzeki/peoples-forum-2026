export interface CloudinaryFile {
  secure_url: string;
  public_id: string;
}

export type ApiFilesType = { [fileName: string]: File & { path: string } } | undefined;