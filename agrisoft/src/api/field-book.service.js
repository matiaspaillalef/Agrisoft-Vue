import conexionApi from '@/services/conexionApi.js'

export default {
  /**
   * Get all application orders for a company
   */
  getOrders(companyId) {
    return conexionApi.get(`/field-book/orders/${companyId}`)
  },

  /**
   * Create a new application order
   */
  createOrder(data) {
    return conexionApi.post('/field-book/orders', data)
  },

  /**
   * Get detail and confirmation of an order
   */
  getOrderDetails(orderId) {
    return conexionApi.get(`/field-book/orders/details/${orderId}`)
  },

  /**
   * Confirm application of a product
   */
  confirmApplication(data) {
    return conexionApi.post('/field-book/confirmations/create', data)
  },

  updateOrder(id, data) {
    return conexionApi.put(`/field-book/orders/${id}`, data)
  },

  finalizeOrder(id) {
    return conexionApi.put(`/field-book/orders/${id}/generate`)
  },

  deleteOrder(id) {
    return conexionApi.delete(`/field-book/orders/${id}`)
  },

  closeOrder(id) {
    return conexionApi.put(`/field-book/orders/${id}/close`)
  },

  // --- CONFIGURATION ---
  getAreas(companyId) {
    return conexionApi.get(`/field-book/config/areas/${companyId}`)
  },
  saveArea(data) {
    return conexionApi.post('/field-book/config/areas', data)
  },
  updateArea(id, data) {
    return conexionApi.put(`/field-book/config/areas/${id}`, data)
  },
  deleteArea(id) {
    return conexionApi.delete(`/field-book/config/areas/${id}`)
  },
  toggleAreaStatus(id, status) {
    return conexionApi.put('/field-book/config/areas/status', { id, status })
  },
  getTasksByArea(areaId) {
    return conexionApi.get(`/field-book/config/tasks/${areaId}`)
  },
  saveTask(data) {
    return conexionApi.post('/field-book/config/tasks', data)
  },
  updateTask(id, data) {
    return conexionApi.put(`/field-book/config/tasks/${id}`, data)
  },
  deleteTask(id) {
    return conexionApi.delete(`/field-book/config/tasks/${id}`)
  },
  toggleTaskStatus(id, status) {
    return conexionApi.put('/field-book/config/tasks/status', { id, status })
  }
}
