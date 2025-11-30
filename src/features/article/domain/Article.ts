export interface ArticleProps {
  id: string;
  workspaceId?: string;
  userId?: string;
  title: string;
  content: string;
  tags: string[];
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

  toPrimitives() {
    return { ...this.props };
  }
}
