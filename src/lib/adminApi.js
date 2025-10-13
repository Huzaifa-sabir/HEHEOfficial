class AdminAPI {
  constructor(token) {
    this.token = token;
    this.baseURL = '/api/admin';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Get all users with pagination and filters
  async getAllUsers(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/users?${searchParams}`);
  }

  // Update a user
  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Delete a user
  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Bulk operations
  async bulkAction(action, userIds) {
    return this.request('/users/bulk-actions', {
      method: 'POST',
      body: JSON.stringify({ action, userIds }),
    });
  }
}

export default AdminAPI;
