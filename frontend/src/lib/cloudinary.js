const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const hasCloudinaryConfig = Boolean(cloudName && uploadPreset);

export async function uploadReportImage(file) {
  if (!file) return '';
  if (!hasCloudinaryConfig) {
    throw new Error('Cloudinary 환경변수가 설정되지 않았습니다.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'ableroute/reports');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || '이미지 업로드에 실패했습니다.');
  }

  return result.secure_url;
}
