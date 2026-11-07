import type { ProblemDetails } from './types'

/** Error thrown for any non-2xx response. Carries the RFC 7807 body when there is one. */
export class ApiError extends Error {
  readonly status: number
  readonly problem: ProblemDetails

  constructor(status: number, problem: ProblemDetails) {
    super(problem.detail ?? problem.title ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }

  /** Validation messages, flattened to "field: message" strings. */
  get messages(): string[] {
    const errors = this.problem.errors ?? {}
    return Object.entries(errors).flatMap(([field, msgs]) =>
      msgs.map((m) => (field ? `${field}: ${m}` : m)),
    )
  }

  /**
   * Messages for one field. Matches case-insensitively and ignores a leading
   * "$." or a parent path, so "name" matches "Name", "$.name" and "input.name".
   */
  fieldErrors(field: string): string[] {
    const wanted = field.toLowerCase()
    const out: string[] = []
    for (const [key, msgs] of Object.entries(this.problem.errors ?? {})) {
      const k = key.toLowerCase().replace(/^\$\./, '')
      if (k === wanted || k.endsWith(`.${wanted}`)) out.push(...msgs)
    }
    return out
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError
}

/** Messages for one field from an unknown error (empty when it is not an ApiError). */
export function fieldErrors(error: unknown, field: string): string[] {
  return isApiError(error) ? error.fieldErrors(field) : []
}

const BASE = '/api'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

async function request<T>(method: Method, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Accept: 'application/json, application/problem+json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError(0, {
      title: 'Cannot reach the server',
      detail: 'The PrintQuote API did not respond. Check that the backend is running on port 5080.',
    })
  }

  const text = await response.text()
  const data: unknown = text ? safeJson(text) : undefined

  if (!response.ok) {
    const problem: ProblemDetails =
      data && typeof data === 'object'
        ? (data as ProblemDetails)
        : { title: response.statusText || 'Request failed', detail: text || undefined }
    throw new ApiError(response.status, { status: response.status, ...problem })
  }
  return data as T
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, undefined, signal),
  post: <T>(path: string, body: unknown, signal?: AbortSignal) => request<T>('POST', path, body, signal),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: (path: string) => request<void>('DELETE', path),
}
