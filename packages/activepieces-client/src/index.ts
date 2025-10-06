import { URLSearchParams } from 'node:url';

import { z } from 'zod';

import {
  FlowOperationRequest,
  FlowOperationType,
  FlowStatus,
  PopulatedFlow,
  SeekPage,
} from '@activepieces/shared';
import {
  ExecutePropsResult,
  PieceMetadataModel,
  PieceMetadataModelSummary,
  PropertyType,
} from '@activepieces/pieces-framework';

import { createFlowSchema, flowOperationSchema } from './schemas';
import {
  ApiError,
  ClientConfig,
  FlowCreateParams,
  FlowListParams,
  IFlowBackend,
  LoadOptionsParams,
  LoadOptionsResult,
  RequestContext,
} from './types';

const DEFAULT_MAX_RETRIES = 3;
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function jitterDelay(baseMs: number): number {
  const jitter = Math.floor(Math.random() * 100);
  return baseMs + jitter;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ApiBackend implements IFlowBackend {
  private readonly baseUrl: string;
  private readonly maxRetries: number;

  constructor(private readonly config: ClientConfig) {
    if (!config.baseUrl) {
      throw new Error('ApiBackend requires a baseUrl');
    }
    if (!config.token) {
      throw new Error('ApiBackend requires an API token');
    }
    if (!config.projectId) {
      throw new Error('ApiBackend requires a projectId');
    }
    this.baseUrl = ensureTrailingSlash(config.baseUrl);
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
  }

  readonly flows = {
    create: (params: FlowCreateParams) => this.createFlow(params),
    update: (flowId: string, operation: FlowOperationRequest) =>
      this.applyOperation(flowId, operation),
    changeStatus: (flowId: string, status: FlowStatus) =>
      this.applyOperation(flowId, {
        type: FlowOperationType.CHANGE_STATUS,
        request: { status },
      }),
    list: (params?: FlowListParams) => this.listFlows(params),
    get: (flowId: string) => this.getFlow(flowId),
  } as const;

  readonly pieces = {
    list: (params?: Record<string, unknown>) => this.listPieces(params),
    get: (
      name: string,
      params?: { version?: string; projectId?: string; locale?: string },
    ) => this.getPiece(name, params),
    loadOptions: <T extends PropertyType = PropertyType.DROPDOWN>(
      params: LoadOptionsParams,
      propertyType: T,
    ) => this.loadPieceOptions(params, propertyType),
  } as const;

  private buildHeaders(additional?: HeadersInit): HeadersInit {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.token}`,
      'Content-Type': 'application/json',
      'Activepieces-Project-Id': this.config.projectId,
    };
    if (this.config.environment) {
      headers['Activepieces-Environment'] = this.config.environment;
    }
    if (this.config.userAgent) {
      headers['User-Agent'] = this.config.userAgent;
    }
    return { ...headers, ...(additional ?? {}) };
  }

  private async request<T>(
    path: string,
    init: RequestInit,
    schema?: z.ZodTypeAny,
  ): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const maxAttempts = Math.max(1, this.maxRetries + 1);

    let lastError: unknown;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const ctx: RequestContext = {
        path,
        method: init.method ?? 'GET',
        attempt,
      };

      try {
        const response = await fetch(url, {
          ...init,
          headers: this.buildHeaders(init.headers),
        });
        ctx.status = response.status;

        if (RETRYABLE_STATUS.has(response.status) && attempt < maxAttempts - 1) {
          await delay(jitterDelay(500 * (attempt + 1)));
          continue;
        }

        if (response.status === 204) {
          return undefined as T;
        }

        const text = await response.text();
        const payload = text ? (JSON.parse(text) as unknown) : undefined;

        if (!response.ok) {
          throw new ApiError(
            `Request failed with status ${response.status} for ${ctx.method} ${path}`,
            response.status,
            payload,
          );
        }

        if (!schema) {
          return payload as T;
        }
        return schema.parse(payload) as T;
      } catch (error) {
        lastError = error;
        const shouldRetry =
          error instanceof ApiError &&
          RETRYABLE_STATUS.has(error.status) &&
          attempt < maxAttempts - 1;
        if (!shouldRetry) {
          throw error;
        }
        await delay(jitterDelay(500 * (attempt + 1)));
      }
    }
    throw lastError ?? new Error('Request failed without error details');
  }

  private async createFlow(params: FlowCreateParams) {
    const payload = createFlowSchema.parse({
      displayName: params.displayName,
      projectId: this.config.projectId,
      folderId: params.folderId ?? undefined,
      metadata: params.metadata ?? undefined,
    });

    return this.request<PopulatedFlow>(
      '/v1/flows',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      undefined,
    );
  }

  private async applyOperation(
    flowId: string,
    operation: FlowOperationRequest,
  ) {
    const payload = flowOperationSchema.parse(operation);
    return this.request(`/v1/flows/${flowId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  private async listFlows(params?: FlowListParams) {
    const search = new URLSearchParams();
    search.set('projectId', this.config.projectId);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        if (Array.isArray(value)) {
          value.forEach((item) => search.append(key, String(item)));
          return;
        }
        search.set(key, String(value));
      });
    }
    const query = search.toString();
    return this.request<SeekPage<PopulatedFlow>>(`/v1/flows${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  private async getFlow(flowId: string) {
    return this.request<PopulatedFlow>(`/v1/flows/${flowId}`, {
      method: 'GET',
    });
  }

  private async listPieces(params?: Record<string, unknown>) {
    const search = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        if (Array.isArray(value)) {
          value.forEach((item) => search.append(key, String(item)));
          return;
        }
        search.set(key, String(value));
      });
    }
    return this.request<PieceMetadataModelSummary[]>(
      `/v1/pieces${search.size ? `?${search.toString()}` : ''}`,
      { method: 'GET' },
    );
  }

  private async getPiece(
    name: string,
    params?: { version?: string; projectId?: string; locale?: string },
  ) {
    const search = new URLSearchParams();
    if (params?.version) {
      search.set('version', params.version);
    }
    if (params?.projectId) {
      search.set('projectId', params.projectId);
    } else {
      search.set('projectId', this.config.projectId);
    }
    if (params?.locale) {
      search.set('locale', params.locale);
    }
    const query = search.toString();
    return this.request<PieceMetadataModel>(
      `/v1/pieces/${encodeURIComponent(name)}${query ? `?${query}` : ''}`,
      { method: 'GET' },
    );
  }

  private async loadPieceOptions<T extends PropertyType>(
    params: LoadOptionsParams,
    propertyType: T,
  ): Promise<LoadOptionsResult<T>> {
    const payload = {
      ...params,
      pieceVersion: params.pieceVersion,
    };
    return this.request<ExecutePropsResult<T>>('/v1/pieces/options', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export class InProcessBackend implements IFlowBackend {
  readonly flows = {
    create: () => {
      throw new Error('InProcessBackend is not implemented in this environment');
    },
    update: () => {
      throw new Error('InProcessBackend is not implemented in this environment');
    },
    changeStatus: () => {
      throw new Error('InProcessBackend is not implemented in this environment');
    },
    list: () => {
      throw new Error('InProcessBackend is not implemented in this environment');
    },
    get: () => {
      throw new Error('InProcessBackend is not implemented in this environment');
    },
  } as const;

  readonly pieces = {
    list: () => {
      throw new Error('InProcessBackend is not implemented in this environment');
    },
    get: () => {
      throw new Error('InProcessBackend is not implemented in this environment');
    },
    loadOptions: () => {
      throw new Error('InProcessBackend is not implemented in this environment');
    },
  } as const;
}

export function createBackendFromEnv(overrides?: Partial<ClientConfig>) {
  const baseUrl = overrides?.baseUrl ?? process.env.AP_BASE_URL;
  const token = overrides?.token ?? process.env.AP_API_TOKEN;
  const projectId = overrides?.projectId ?? process.env.AP_PROJECT_ID;
  const environment = overrides?.environment ?? process.env.AP_ENVIRONMENT;

  if (!baseUrl || !token || !projectId) {
    throw new Error(
      'AP_BASE_URL, AP_API_TOKEN, and AP_PROJECT_ID environment variables must be set',
    );
  }

  return new ApiBackend({
    baseUrl,
    token,
    projectId,
    environment: environment ?? process.env.NODE_ENV ?? 'development',
    userAgent: overrides?.userAgent,
    maxRetries: overrides?.maxRetries,
  });
}

export * from './types';
export * from './schemas';
