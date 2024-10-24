/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Neo4jGraphConfig } from './types';
import { EmbedderArgument } from '@genkit-ai/ai/embedder';
import {
  CommonRetrieverOptionsSchema,
  indexerRef,
  retrieverRef,
} from '@genkit-ai/ai/retriever';
import { genkitPlugin, PluginProvider } from '@genkit-ai/core';
import { configureNeo4jIndexer } from './indexer';
import { configureNeo4jRetriever } from './retriever';
import * as z from 'zod';

/**
 * Neo4j plugin for indexing and retrieval
 */
export function neo4j<EmbedderCustomOptions extends z.ZodTypeAny>(
  params: {
    clientParams: Neo4jGraphConfig;
    indexId: string;
    embedder: EmbedderArgument<EmbedderCustomOptions>;
    embedderOptions?: z.infer<EmbedderCustomOptions>;
  }[]
): PluginProvider {
  const plugin = genkitPlugin(
    'neo4j',
    async (
      params: {
        clientParams: Neo4jGraphConfig;
        indexId: string;
        embedder: EmbedderArgument<EmbedderCustomOptions>;
        embedderOptions?: z.infer<EmbedderCustomOptions>;
      }[]
    ) => ({
      retrievers: params.map((i) => configureNeo4jRetriever(i)),
      indexers: params.map((i) => configureNeo4jIndexer(i)),
    })
  );
  return plugin(params);
}

export const Neo4jRetrieverOptionsSchema = CommonRetrieverOptionsSchema.extend({
  k: z.number().max(1000)
});

export const Neo4jIndexerOptionsSchema = z.object({
});

export const neo4jRetrieverRef = (params: {
  indexId: string;
  displayName?: string;
}) => {
  return retrieverRef({
    name: `neo4j/${params.indexId}`,
    info: {
      label: params.displayName ?? `Neo4j - ${params.indexId}`,
    },
    configSchema: Neo4jRetrieverOptionsSchema,
  });
};

export const neo4jIndexerRef = (params: {
  indexId: string;
  displayName?: string;
}) => {
  return indexerRef({
    name: `neo4j/${params.indexId}`,
    info: {
      label: params.displayName ?? `Neo4j - ${params.indexId}`,
    },
    configSchema: Neo4jIndexerOptionsSchema.optional(),
  });
};

export default neo4j;