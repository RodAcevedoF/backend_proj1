export interface WorkspaceProps {
  id: string;
  name: string;
  createdAt: Date;
}

export class Workspace {
  constructor(private props: WorkspaceProps) {}

  get id() {
    return this.props.id;
  }

  toPrimitives() {
    return { ...this.props };
  }
}
