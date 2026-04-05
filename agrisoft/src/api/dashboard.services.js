import conexionApi from '@/services/conexionApi.js';

export const DashboardService = {
    // 1. Kilos por día
    getDataKgDay(companyID, groundID) {
        return conexionApi.get(`/filter/dashboard/dataKgDay/${companyID}/${groundID}`)
            .then(res => res.data?.data || { kg_boxes: 0 })
            .catch(() => ({ kg_boxes: 0 }));
    },

    // 2. Kilos temporada
    getDataKgSeason(companyID, groundID) {
        return conexionApi.post(`/filter/dashboard/dataKgSeason/${companyID}/${groundID}`)
            .then(res => res.data?.data || { kg_boxes: 0 })
            .catch(() => ({ kg_boxes: 0 }));
    },

    // 3. Conteo de trabajadores hoy
    getDataWorkersCount(companyID, groundID) {
        return conexionApi.post(`/filter/dashboard/dataWorkersCount/${companyID}/${groundID}`)
            .then(res => res.data?.data || { workersCount: 0 })
            .catch(() => ({ workersCount: 0 }));
    },

    // 4. Registros de cosecha hoy
    getDataWorkersWeek(companyID, groundID) {
        return conexionApi.post(`/filter/dashboard/dataWorkersWeek/${companyID}/${groundID}`)
            .then(res => res.data?.data || { workersWeek: 0 })
            .catch(() => ({ workersWeek: 0 }));
    },

    // 5. Variedades día
    getDataVaritiesDay(companyID, groundID) {
        return conexionApi.post(`/filter/dashboard/dataVaritiesDay/${companyID}/${groundID}`)
            .then(res => res.data?.data || [])
            .catch(() => []);
    },

    // 6. Variedades temporada
    getDataVaritiesSeason(companyID, groundID) {
        return conexionApi.post(`/filter/dashboard/dataVaritiesSeason/${companyID}/${groundID}`)
            .then(res => res.data?.data || [])
            .catch(() => []);
    },

    // 7. Días de cosecha
    getDataDaysOfHarvest(companyID, groundID) {
        return conexionApi.post(`/filter/dashboard/dataDaysOfHarvest/${companyID}/${groundID}`)
            .then(res => res.data?.data || [])
            .catch(() => []);
    },

    // 8. Días de cosecha totales
    getDataAllDaysOfHarvest(companyID, groundID) {
        return conexionApi.post(`/filter/dashboard/dataAllDaysOfHarvest/${companyID}/${groundID}`)
            .then(res => res.data?.data || [])
            .catch(() => []);
    },

    // 9. Porcentaje variedades temporada (para Pie Chart)
    getDataVarietiesSeasonPercentage(companyID, groundID) {
        return conexionApi.post(`/filter/dashboard/dataVarietiesSeasonPercentage/${companyID}/${groundID}`)
            .then(res => res.data?.data || [])
            .catch(() => []);
    },

    // 10. Humedad y Temperatura
    getDataHumidityTemperatureSeason(companyID, groundID) {
        return conexionApi.post(`/filter/dashboard/dataHumidityTemperatureSeason/${companyID}/${groundID}`)
            .then(res => res.data?.data || { humedad: [], temperatura: [], fechas: [] })
            .catch(() => ({ humedad: [], temperatura: [], fechas: [] }));
    },

    // 11. Kilos por campo (Todos los campos)
    getDataKgGroundAll(companyID) {
        return conexionApi.post(`/filter/dashboard/dataKgGroundAll/${companyID}/0`)
            .then(res => res.data?.data || [])
            .catch(() => []);
    },

    // 12. Kilos por rango horario temporada
    getDataKgGroundAllTemp(companyID) {
        return conexionApi.post(`/filter/dashboard/dataKgGroundAllTemp/${companyID}/0`)
            .then(res => res.data?.data || [])
            .catch(() => []);
    },

    // 13. Kilos por rango horario día
    getDataKgGroundAllDay(companyID) {
        return conexionApi.post(`/filter/dashboard/dataKgGroundAllDay/${companyID}/0`)
            .then(res => res.data?.data || [])
            .catch(() => []);
    },

    // 14. Obtener campos/terrenos
    getGrounds(companyID) {
        return conexionApi.get(`/configuracion/production/getGround/${companyID}`)
            .then(res => res.data?.grounds || [])
            .catch(() => []);
    }
};
