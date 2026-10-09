import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createSolidPng(width, height, r, g, b, a = 255) {
  // Simple uncompressed or compressed raw RGBA PNG writer
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    
    // CRC calculation
    let crc = 0xffffffff;
    const combined = Buffer.concat([typeBuf, data]);
    for (let i = 0; i < combined.length; i++) {
      let c = combined[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ c) & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc = crc >>> 1;
        }
        c = c >>> 1;
      }
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method
  const ihdrChunk = chunk('IHDR', ihdrData);

  // Raw image data: for each row, 1 filter byte (0) + width * 4 bytes
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  
  // Fill gradient from Cupertino Blue (#007AFF -> #0055D4)
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type None
    const ratio = y / height;
    const curR = Math.round(r * (1 - ratio * 0.2));
    const curG = Math.round(g * (1 - ratio * 0.25));
    const curB = Math.round(b * (1 - ratio * 0.15));

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = curR;
      rawData[pxOffset + 1] = curG;
      rawData[pxOffset + 2] = curB;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Cupertino Blue: rgb(0, 122, 255)
const icon192 = createSolidPng(192, 192, 0, 122, 255);
const icon512 = createSolidPng(512, 512, 0, 122, 255);
const iconApple = createSolidPng(180, 180, 0, 122, 255);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), icon512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), iconApple);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createSolidPng(32, 32, 0, 122, 255));

console.log('PNG PWA Icons generated successfully!');
