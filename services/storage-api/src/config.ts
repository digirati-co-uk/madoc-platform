export const port = process.env.SERVER_PORT || 3000;

export const gatewayHost = process.env.GATEWAY_HOST || '';

export const fileSizeLimitMb = process.env.FILE_SIZE_LIMIT || '5';
export const jsonFileSizeLimitMb = process.env.JSON_FILE_SIZE_LIMIT || null;
export const textFileSizeLimitMb = process.env.TEXT_FILE_SIZE_LIMIT || null;
export const formFileSizeLimitMb = process.env.FORM_FILE_SIZE_LIMIT || null;
