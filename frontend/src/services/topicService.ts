export interface Topic {
  id: number;
  name: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const topicService = {
  async getAllTopics(token?: string): Promise<Topic[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token && token.trim() !== "") {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/api/topics/`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to fetch topics');
    }
    return response.json();
  },
};
