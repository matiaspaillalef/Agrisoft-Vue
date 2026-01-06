import conexionApi from '@/services/conexionApi.js'

export const CompanyService = {
  async getCompanies() {
    const res = await conexionApi.get('/configuracion/empresas/getEmpresas')
    console.log('🚀 ~ file: company.services.js:6 ~ getCompanies ~ res:', res)
    return res.data?.companies || []
  }
}
