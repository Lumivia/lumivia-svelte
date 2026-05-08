export const formatDatesLumivia = (startDateIso?: string | null, endDateIso?: string | null): string => {
    // 🔥 BLINDAJE 1: Prevención de colapso por datos nulos
    if (!startDateIso) return 'Fechas por confirmar';

    try {
        const start = new Date(startDateIso);
        
        // Verificación de fecha inválida
        if (isNaN(start.getTime())) return 'Fechas no disponibles';

        // 🔥 ESTANDARIZACIÓN TIER 1: Solo fechas, cero horas.
        const dateOptions: Intl.DateTimeFormatOptions = { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
        };

        const dateFormatter = new Intl.DateTimeFormat('es-ES', dateOptions);

        const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

        const startText = cap(dateFormatter.format(start));

        // Manejo seguro de la fecha de retorno
        if (!endDateIso) {
            return `Salida: ${startText}`;
        }

        const end = new Date(endDateIso);
        if (isNaN(end.getTime())) return `Salida: ${startText}`;

        const endText = cap(dateFormatter.format(end));

        return `${startText} — ${endText}`;

    } catch (error) {
        console.error("Error formateando fechas:", error);
        return 'Fechas disponibles en detalle';
    }
};
