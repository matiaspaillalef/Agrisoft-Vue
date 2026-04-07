import api from './index.js'

export const MenuService = {
  async getMenuByRol(rolId) {
    const res = await api.get(`/api/v1/getMenubyRol/${rolId}`)
    return res.data.menus
  },
  async getUnreadSupport() {
    return await api.get('/api/v1/support/unread-count')
  }
}
