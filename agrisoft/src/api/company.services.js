import conexionApi from '@/services/conexionApi.js'

export const CompanyService = {
  async getCompanies() {
    const res = await conexionApi.get('/configuracion/empresas/getEmpresas')
    return res.data?.companies || []
  },
  async updateLogo(companyId, logoBase64) {
    const res = await conexionApi.post('/configuracion/empresas/updateLogo', { companyId, logoBase64 })
    return res.data
  },
  async getCompany(companyId) {
    const res = await conexionApi.get(`/configuracion/empresas/getEmpresa/${companyId}`)
    return res.data?.company || null
  }
}
