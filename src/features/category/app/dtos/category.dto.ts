export interface CreateCategoryDto {
  workspaceId: string;
  name: string;
  description?: string;
  color?: string;
  userId: string; // From req.user
}

export interface UpdateCategoryDto {
  id: string;
  name?: string;
  description?: string;
  color?: string;
}

export interface CategoryResponseDto {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
