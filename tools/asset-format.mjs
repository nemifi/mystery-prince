import { requireCondition } from '../foundation/errors.mjs';

export function verifyAssetFormat(bytes, extension, path) {
  const formats = {
    // Header check only. Actual decoding is independently checked in Chromium;
    // JPEG decoders may accept a missing end marker in inherited source art.
    jpg: { mediaType: 'image/jpeg', valid: bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
    png: { mediaType: 'image/png', valid: bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) },
    webp: { mediaType: 'image/webp', valid: bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP' },
    svg: { mediaType: 'image/svg+xml', valid: /^<svg\s/.test(bytes.toString('utf8')) && bytes.toString('utf8').includes('xmlns="http://www.w3.org/2000/svg"') && !/<script|<foreignObject|<!DOCTYPE|<!ENTITY|@import|\son\w+\s*=|(?:href|src)\s*=/i.test(bytes.toString('utf8')) && [...bytes.toString('utf8').matchAll(/url\(([^)]+)\)/gi)].every(match => /^#[\w:-]+$/.test(match[1].trim())) }
  };
  requireCondition(formats[extension]?.valid, 'ASSET_FORMAT', `Invalid or unsupported ${extension} source: ${path}`);
  return formats[extension].mediaType;
}
