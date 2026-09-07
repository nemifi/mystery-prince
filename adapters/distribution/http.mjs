import { verifyPublication } from '../../foundation/packages.mjs';
import { digestBytes } from '../../foundation/data.mjs';
import { requireCondition } from '../../foundation/errors.mjs';

export class HttpSource {
  constructor(base, request = globalThis.fetch.bind(globalThis)) { this.base = new URL(base); this.request = request; }
  url(path) {
    const url = new URL(path, this.base);
    requireCondition(url.origin === this.base.origin && url.pathname.startsWith(this.base.pathname) && !path.includes('..'), 'INVALID_RESOURCE_PATH', 'Resource must remain within the publication site');
    return url;
  }
  async json(path) {
    const response = await this.request(this.url(path));
    requireCondition(response.ok, 'CONTENT_UNAVAILABLE', `Could not load ${path}: HTTP ${response.status}`);
    return response.json();
  }
  async publication(path) { return verifyPublication(await this.json(path)); }
}
export class VerifiedAssets {
  constructor(source) { this.source = source; this.blobs = new Map(); }
  async forPublication(publication) {
    const bindings = new Map();
    await Promise.all(publication.assets.map(async asset => {
      if (!this.blobs.has(asset.digest)) {
        const response = await this.source.request(this.source.url(asset.path));
        requireCondition(response.ok, 'ASSET_UNAVAILABLE', `Could not load ${asset.id}`);
        const bytes = await response.arrayBuffer();
        requireCondition(bytes.byteLength === asset.bytes && await digestBytes(bytes) === asset.digest, 'ASSET_INTEGRITY', `Asset ${asset.id} does not match this publication`);
        this.blobs.set(asset.digest, URL.createObjectURL(new Blob([bytes], { type: asset.mediaType })));
      }
      bindings.set(asset.id, this.blobs.get(asset.digest));
    }));
    return { resolve: id => { requireCondition(bindings.has(id), 'ASSET_UNDECLARED', `Undeclared asset ${id}`); return bindings.get(id); } };
  }
  dispose() { for (const url of this.blobs.values()) URL.revokeObjectURL(url); this.blobs.clear(); }
}
