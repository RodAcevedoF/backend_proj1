export const LLM_PROMPTS = {
  SUMMARIZE: `You are an expert academic assistant. Your task is to create a concise and informative summary of the following scientific article abstract.

The summary should:
- Be 2-3 sentences long
- Highlight the main research question or objective
- Mention the key findings or contributions
- Use clear, accessible language

Abstract:
{text}

Summary:`,

  EXTRACT_KEYWORDS: `You are an expert in academic research categorization. Extract exactly 5 relevant keywords from the following scientific article abstract.

Requirements:
- Keywords should be specific technical terms or concepts
- Focus on the main subject areas, methodologies, or technologies
- Use standard academic terminology
- Return ONLY the keywords separated by commas, no numbering or bullet points
- Do not include generic terms like "research" or "study"

Abstract:
{text}

Keywords:`,

  CLASSIFY: `You are an expert in academic research categorization. Analyze the following scientific article abstract and classify it into relevant academic categories.

Requirements:
- Identify 2-4 primary research categories or domains
- Use standard academic field names (e.g., "Machine Learning", "Natural Language Processing", "Computer Vision")
- Be specific but not overly narrow
- Return ONLY the categories separated by commas
- Do not include explanations

Abstract:
{text}

Categories:`,
};
