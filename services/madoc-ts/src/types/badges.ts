// create table badge
// (
//     id           uuid primary key,
//     site_id      integer references site (id),
//     label        jsonb not null,
//     description  jsonb,
//     svg_code     text,
//     tier_colors  text[],
//     trigger_name text,
//     created_at   timestamp,
//     updated_at   timestamp
// );
//
// create table badge_award
// (
//     id          uuid primary key,
//     site_id     integer references site (id) not null,
//     user_id     integer references "user" (id) not null,
//     project_id  integer references iiif_project (id),
//     badge_id    uuid references badge (id),
//     awarded_by  integer references "user" (id),
//     reason      text,
//     tier        int,
//     awarded_at  timestamp not null default CURRENT_TIMESTAMP
// );

import { InternationalString } from '@iiif/presentation-3';

export interface BadgeRow {
  id: string;
  site_id?: number;
  label: InternationalString;
  description?: InternationalString;
  svg_code?: string;
  tier_colors?: string[];
  trigger_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  site_id?: number;
  label: InternationalString;
  description?: InternationalString;
  svg: string;
  tier_colors?: string[];
  trigger_name?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface BadgeAwardRow extends BadgeRow {
  badge_id: string;
  user_id: number;
  user_name?: string;
  project_id?: number;
  awarded_by?: number;
  awarded_by_name?: string;
  reason?: string;
  tier?: number;
  awarded_at: string;
}

export interface BadgeAward {
  id: string;
  project_id?: number;
  awarded_by?: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
  };
  reason?: string;
  tier?: number;
  awarded_at: Date;
  badge: Badge;
}

export type CreateBadgeRequest = Omit<Badge, 'site_id' | 'id' | 'created_at' | 'updated_at'>;
export type AwardBadgeRequest = {
  badge_id: string;
  user_id: number;
  project_id?: number;
  awarded_by?: number;
  reason?: string;
  tier?: number;
};
