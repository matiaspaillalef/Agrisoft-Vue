import conexionApi from '@/services/conexionApi'

export default {
    // --- CATEGORIES ---
    getCategories(companyId) {
        return conexionApi.get(`/product-categories/${companyId}`)
    },
    saveCategory(data) {
        return conexionApi.post('/product-categories', data)
    },
    updateCategory(id, data) {
        return conexionApi.put(`/product-categories/${id}`, data)
    },
    deleteCategory(id) {
        return conexionApi.delete(`/product-categories/${id}`)
    },

    // --- SUBCATEGORIES ---
    getSubcategories(categoryId) {
        return conexionApi.get(`/product-subcategories/${categoryId}`)
    },
    saveSubcategory(data) {
        return conexionApi.post('/product-subcategories', data)
    },
    updateSubcategory(id, data) {
        return conexionApi.put(`/product-subcategories/${id}`, data)
    },
    deleteSubcategory(id) {
        return conexionApi.delete(`/product-subcategories/${id}`)
    },
    getAllSubcategories(companyId) {
        return conexionApi.get(`/all-subcategories/${companyId}`)
    }
}
