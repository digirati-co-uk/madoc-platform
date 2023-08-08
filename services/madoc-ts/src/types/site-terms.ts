//     id             uuid primary key,
//     site_id        integer references site (id),
//     created_at     timestamp not null default CURRENT_TIMESTAMP,
//     terms_markdown text not null,
//     terms_text     text not null
export interface SiteTermsRow {
  id: string;
  site_id: number;
  created_at: string;
  terms_markdown?: string;
  terms_text?: string;
}

export interface SiteTerms {
  id: string;
  createdAt: Date;
  terms?: {
    markdown: string;
    text: string;
  };
}
