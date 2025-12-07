export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface WorkspaceProps {
  id: string;
  name: string;
  description?: string;
  members: WorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

export class Workspace {
  constructor(private props: WorkspaceProps) {}

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get members() {
    return this.props.members;
  }

  isMember(userId: string): boolean {
    return this.props.members.some((m) => m.userId === userId);
  }

  isOwner(userId: string): boolean {
    return this.props.members.some(
      (m) => m.userId === userId && m.role === 'owner'
    );
  }

  canEdit(userId: string): boolean {
    const member = this.props.members.find((m) => m.userId === userId);
    return member?.role === 'owner' || member?.role === 'admin';
  }

  toPrimitives() {
    return { ...this.props };
  }
}
