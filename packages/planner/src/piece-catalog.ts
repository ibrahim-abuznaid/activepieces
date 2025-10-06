import { promises as fs } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import os from 'node:os';

import {
  PieceMetadataModel,
  PieceMetadataModelSummary,
} from '@activepieces/pieces-framework';
import { IFlowBackend } from '@flowpilot/activepieces-client';

interface CacheFile {
  fetchedAt: number;
  pieces: PieceMetadataModelSummary[];
}

export interface PieceCatalogOptions {
  cachePath?: string;
  ttlMs?: number;
}

const DEFAULT_TTL = 1000 * 60 * 30; // 30 minutes

export class PieceCatalog {
  private summaries: PieceMetadataModelSummary[] | null = null;
  private readonly cachePath: string;
  private readonly ttlMs: number;
  private readonly metadata = new Map<string, PieceMetadataModel>();

  constructor(
    private readonly backend: IFlowBackend,
    options: PieceCatalogOptions = {},
  ) {
    this.cachePath =
      options.cachePath ?? join(os.homedir(), '.flowpilot', 'pieces-cache.json');
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL;
  }

  async listPieces(options: { refresh?: boolean } = {}) {
    if (!options.refresh) {
      const cached = await this.readCache();
      if (cached) {
        this.summaries = cached;
        return cached;
      }
    }

    const pieces = await this.backend.pieces.list();
    this.summaries = pieces;
    await this.writeCache(pieces).catch(() => undefined);
    return pieces;
  }

  async getPiece(name: string) {
    if (this.metadata.has(name)) {
      return this.metadata.get(name)!;
    }
    const piece = await this.backend.pieces.get(name);
    this.metadata.set(name, piece);
    return piece;
  }

  async ensurePieces(names: string[]) {
    await Promise.all(names.map((name) => this.getPiece(name).catch(() => undefined)));
  }

  private async readCache(): Promise<PieceMetadataModelSummary[] | null> {
    try {
      const raw = await fs.readFile(this.cachePath, 'utf8');
      const parsed = JSON.parse(raw) as CacheFile;
      if (Date.now() - parsed.fetchedAt > this.ttlMs) {
        return null;
      }
      return parsed.pieces;
    } catch (error) {
      return null;
    }
  }

  private async writeCache(pieces: PieceMetadataModelSummary[]) {
    await mkdir(dirname(this.cachePath), { recursive: true });
    const payload: CacheFile = {
      fetchedAt: Date.now(),
      pieces,
    };
    await fs.writeFile(this.cachePath, JSON.stringify(payload, null, 2), 'utf8');
  }
}
