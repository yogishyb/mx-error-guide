import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

export interface MessageDefinition {
  id: string;
  full_id: string;
  name: string;
  business_area: string;
  business_area_name: string;
  purpose: string;
  mt_equivalent?: string[];
  real_world_use_cases: string[];
  when_used: string;
  used_in_systems?: string[];
  key_elements: Record<string, string>;
  sample_xml: string | null;
  sources: { name: string; url: string }[];
  documentation_url: string;
}

export interface BusinessArea {
  code: string;
  name: string;
  description: string;
}

export interface SampleFlow {
  name: string;
  description: string;
  actors?: string[];
  steps: {
    step: number;
    message: string;
    from?: string;
    to?: string;
    direction?: string;
    description: string;
  }[];
}

export interface PaymentSystem {
  id: string;
  name: string;
  full_name: string;
  region: string;
  type: string;
  settlement: string;
  speed: string;
  description: string;
  key_features: string[];
  url: string;
}

export interface MtMapping {
  mt: string;
  mx: string;
  name: string;
  notes: string;
}

interface MessageDefinitionsData {
  metadata: {
    version: string;
    generated: string;
    source: string;
    description: string;
  };
  business_areas: BusinessArea[];
  messages: MessageDefinition[];
  payment_flows: SampleFlow[];
  payment_systems: PaymentSystem[];
  mt_to_mx_mappings: MtMapping[];
}

export function useMessageDefinitions() {
  const [data, setData] = useState<MessageDefinitionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
    fetch(`${baseUrl}data/message_definitions.json`)
      .then((res) => res.json())
      .then((data: MessageDefinitionsData) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load message definitions');
        setLoading(false);
        console.error(err);
      });
  }, []);

  return {
    messages: data?.messages ?? [],
    businessAreas: data?.business_areas ?? [],
    sampleFlows: data?.payment_flows ?? [],
    paymentSystems: data?.payment_systems ?? [],
    mtMappings: data?.mt_to_mx_mappings ?? [],
    loading,
    error,
  };
}

export function useMessageSearch(messages: MessageDefinition[]) {
  const [query, setQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');

  const fuse = useMemo(
    () =>
      new Fuse(messages, {
        keys: [
          { name: 'id', weight: 2 },
          { name: 'name', weight: 1.5 },
          { name: 'purpose', weight: 1 },
          { name: 'usage', weight: 0.8 },
          { name: 'business_area_name', weight: 0.5 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [messages]
  );

  const results = useMemo(() => {
    let filtered = messages;

    // Search
    if (query.trim()) {
      const searchResults = fuse.search(query);
      filtered = searchResults.map((r) => r.item);
    }

    // Filter by business area
    if (selectedArea) {
      filtered = filtered.filter((m) => m.business_area === selectedArea);
    }

    return filtered;
  }, [query, selectedArea, messages, fuse]);

  return {
    query,
    setQuery,
    selectedArea,
    setSelectedArea,
    results,
    totalCount: messages.length,
  };
}
