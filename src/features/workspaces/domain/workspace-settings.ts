import { ValueObject } from '@/core/domain/ValueObject';

interface WorkspaceSettingsProps {
  allowPublicAccess: boolean;
  defaultArticleVisibility: 'private' | 'workspace' | 'public';
  enableAIEnrichment: boolean;
  maxMembersPerWorkspace?: number;
}

/**
 * Workspace Settings Value Object
 * Contains workspace configuration and preferences
 */
export class WorkspaceSettings extends ValueObject<WorkspaceSettingsProps> {
  private constructor(props: WorkspaceSettingsProps) {
    super(props);
  }

  static createDefault(): WorkspaceSettings {
    return new WorkspaceSettings({
      allowPublicAccess: false,
      defaultArticleVisibility: 'workspace',
      enableAIEnrichment: true,
    });
  }

  static create(props: WorkspaceSettingsProps): WorkspaceSettings {
    return new WorkspaceSettings(props);
  }

  get allowPublicAccess(): boolean {
    return this.props.allowPublicAccess;
  }

  get defaultArticleVisibility(): 'private' | 'workspace' | 'public' {
    return this.props.defaultArticleVisibility;
  }

  get enableAIEnrichment(): boolean {
    return this.props.enableAIEnrichment;
  }

  get maxMembersPerWorkspace(): number | undefined {
    return this.props.maxMembersPerWorkspace;
  }

  /**
   * Update settings
   */
  update(updates: Partial<WorkspaceSettingsProps>): WorkspaceSettings {
    return new WorkspaceSettings({
      ...this.props,
      ...updates,
    });
  }

  toPrimitives() {
    return {
      allowPublicAccess: this.props.allowPublicAccess,
      defaultArticleVisibility: this.props.defaultArticleVisibility,
      enableAIEnrichment: this.props.enableAIEnrichment,
      maxMembersPerWorkspace: this.props.maxMembersPerWorkspace,
    };
  }
}
