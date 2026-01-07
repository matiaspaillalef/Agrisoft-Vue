import conexionApi from '@/services/conexionApi.js'

export const CompanyService = {
  async getCompanies() {
    const res = await conexionApi.get('/configuracion/empresas/getEmpresas')
    return res.data?.companies || []
  }
}
