export type ProjectRow = {
  id: number;
  task_id: string;
  collection_id: string;
  slug: string | null;
  capture_model_id: number;
  template: string | null;
};

// New project fields.

export interface ProjectFeedbackRow {
  id: number;
  project_id: number;
  user_id: number;
  created: Date;
  feedback: string;
  // Joins
  user_name?: string;
}

export interface ProjectFeedback {
  id: number;
  user:
    | {
        id: number;
        name?: string;
      }
    | undefined;
  created: Date;
  feedback: string;
}

export interface ProjectUpdateSnapshot {
  submissions?: number;
  reviews?: number;
  resources?: number;
}

export interface ProjectUpdatesRow {
  id: number;
  project_id: number;
  user_id: number;
  created: Date;
  update: string;
  snapshot: ProjectUpdateSnapshot;
  // Joins
  user_name?: string;
}

export interface ProjectUpdate {
  id: number;
  user:
    | {
        id: number;
        name?: string;
      }
    | undefined;

  created: Date;
  update: string;
  snapshot: ProjectUpdateSnapshot;
}

export interface CreateProjectUpdate {
  update: string;
  snapshot?: ProjectUpdateSnapshot;
}

export interface ProjectMemberRow {
  id: number;
  project_id: number;
  user_id: number;
  created: Date;
  role: string | null;
  role_label: string | null;
  role_color: string | null;
  // Joins
  user_name?: string;
  project_slug?: string;
}

export interface ProjectMemberRole {
  id: string;
  label: string;
  color?: string;
}

export interface ProjectMember {
  id: number;
  user: {
    id: number;
    name?: string;
  };
  project:
    | {
        id: number;
        slug: string;
      }
    | undefined;
  created: Date;
  role: ProjectMemberRole | undefined;
}
