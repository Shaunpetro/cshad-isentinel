// src/services/infrastructure/types.ts

export type InfrastructureType = 'electricity' | 'water' | 'roads' | 'telecom' | 'other';
export type InfrastructureSeverity = 'critical' | 'major' | 'minor' | 'info';
export type InfrastructureStatus = 'active' | 'scheduled' | 'resolved';

export interface LoadsheddingSlot {
  start: Date;
  end: Date;
  stage: number;
}

export interface LoadsheddingStatus {
  stage: number;
  stageUpdated: Date;
  nextStages: Array<{
    stage: number;
    startTime: Date;
  }>;
  source: string;
  // New fields for hybrid approach
  isNational: boolean;
  suburbId?: string;
  suburbName?: string;
  localSchedule?: LoadsheddingSlot[];
  nextOutage?: LoadsheddingSlot;
}

export interface InfrastructureAlert {
  id: string;
  type: InfrastructureType;
  severity: InfrastructureSeverity;
  status: InfrastructureStatus;
  title: string;
  description: string;
  source: string;
  affectedAreas: string[];
  startTime: Date;
  endTime?: Date;
  updatedAt: Date;
  // Specific to electricity
  loadshedding?: {
    stage: number;
    areaCode?: string;
    schedule?: LoadsheddingSlot[];
  };
}

// EskomSePush API Types (kept for compatibility if user adds paid key later)
export interface ESPStatusResponse {
  status: {
    capetown: {
      name: string;
      next_stages: Array<{
        stage: string;
        stage_start_timestamp: string;
      }>;
      stage: string;
      stage_updated: string;
    };
    eskom: {
      name: string;
      next_stages: Array<{
        stage: string;
        stage_start_timestamp: string;
      }>;
      stage: string;
      stage_updated: string;
    };
  };
}

export interface ESPAreaInfo {
  events: Array<{
    end: string;
    note: string;
    start: string;
  }>;
  info: {
    name: string;
    region: string;
  };
  schedule: {
    days: Array<{
      date: string;
      name: string;
      stages: string[][];
    }>;
    source: string;
  };
}

// Suburb search result
export interface SuburbSearchResult {
  id: string;
  name: string;
  municipality: string;
  province: string;
}