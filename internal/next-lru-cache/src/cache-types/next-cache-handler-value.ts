import type { CacheHandlerValue } from '@neshca/next-common';
import type { LRUCache } from 'lru-cache';

import type { LruCacheOptions } from '../create-configured-cache';
import { createConfiguredCache } from '../create-configured-cache';

function calculateObjectSize({ value }: CacheHandlerValue): number {
    // Return default size if value is falsy
    if (!value) {
        return 25;
    }

    switch (value.kind) {
        case 'REDIRECT': {
            // Calculate size based on the length of the stringified props
            return JSON.stringify(value.props).length;
        }
        case 'IMAGE': {
            // Throw a specific error for image kind
            throw new Error('Image kind should not be used for incremental-cache calculations.');
        }
        case 'FETCH': {
            // Calculate size based on the length of the stringified data
            return JSON.stringify(value.data || '').length;
        }
        case 'ROUTE': {
            // Size based on the length of the body
            return value.body.length;
        }
        case 'APP_PAGE': {
            return value.html.length + (JSON.stringify(value.rscData)?.length ?? 0);
        }
        case 'PAGE': {
            return value.html.length + (JSON.stringify(value.pageData)?.length ?? 0);
        }
        default: {
            throw new Error('Unknown cache handler value kind');
        }
    }
}

export type { LruCacheOptions };

export default function createCacheStore(options?: LruCacheOptions): LRUCache<string, CacheHandlerValue> {
    return createConfiguredCache(calculateObjectSize, options);
}
