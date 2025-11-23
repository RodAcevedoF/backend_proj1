import { Role } from './Role';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  workspaceId: string;
  createdAt: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }
  get email() {
    return this.props.email;
  }
  get role() {
    return this.props.role;
  }
  get workspaceId() {
    return this.props.workspaceId;
  }

  checkPassword(hash: string) {
    return this.props.passwordHash === hash;
  }

  toPrimitives() {
    return { ...this.props };
  }
}
