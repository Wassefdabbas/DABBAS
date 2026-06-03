/**
 * Ambient types for the Cloudinary Upload Widget script (loaded at runtime via
 * <Script src="https://upload-widget.cloudinary.com/...">). Only the surface
 * we actually use is typed.
 */
type CloudinaryUploadResult = {
  event?: string;
  info?: { public_id?: string };
};

type CloudinaryWidgetOptions = {
  cloudName: string;
  apiKey: string;
  resourceType?: string;
  sources?: string[];
  multiple?: boolean;
  showAdvancedOptions?: boolean;
  uploadSignature?: (
    callback: (signature: string) => void,
    paramsToSign: Record<string, string | number>,
  ) => void;
};

interface CloudinaryWidgetInstance {
  open: () => void;
}

interface CloudinaryGlobal {
  createUploadWidget: (
    options: CloudinaryWidgetOptions,
    callback: (error: unknown, result: CloudinaryUploadResult) => void,
  ) => CloudinaryWidgetInstance;
}

interface Window {
  cloudinary?: CloudinaryGlobal;
}
