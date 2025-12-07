export type ArticleStatus = 'external_raw' | 'enriched' | 'user_created';
export type ArticleSource = 'semantic-scholar' | 'user' | 'arxiv' | 'pubmed';

export interface ArticleProps {
  id: string;
  workspaceId?: string;
  userId?: string;
  title: string;
  content: string;
  tags: string[];

  // Metadata
  status: ArticleStatus;
  source: ArticleSource;
  externalId?: string; // ID from external provider (e.g., Semantic Scholar paper ID)

  // AI-enriched fields (only populated when status is 'enriched')
  summary?: string;
  categories?: string[];

  // External article metadata
  url?: string;
  authors?: string[];
  publishedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export class Article {
  private props: ArticleProps;

  constructor(props: ArticleProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get workspaceId() {
    return this.props.workspaceId;
  }

  get title() {
    return this.props.title;
  }

  get content() {
    return this.props.content;
  }

  get tags() {
    return this.props.tags;
  }

  get status() {
    return this.props.status;
  }

  get source() {
    return this.props.source;
  }

  isEnriched(): boolean {
    return this.props.status === 'enriched';
  }

  isExternal(): boolean {
    return this.props.status === 'external_raw';
  }

  toPrimitives() {
    return { ...this.props };
  }
}
