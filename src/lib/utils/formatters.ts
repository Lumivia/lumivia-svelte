export const formatDatesLumivia = (startDateIso?: string | null, endDateIso?: string | null): string => {
    // 🔥 BLINDAJE 1: Prevención de colapso por datos nulos en Supabase
    if (!startDateIso) return 'Fechas por confirmar';

    try {
        const start = new Date(startDateIso);
        
        // Verificación de fecha inválida (por si el string de base de datos viene corrupto)
        if (isNaN(start.getTime())) return 'Fechas no disponibles';

        const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
        const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };

        // 🔥 BLINDAJE 2: Eliminamos el hardcodeo de México. 
        // Dejamos que JS use la hora local del dispositivo, o UTC si prefieres mantener la del string original.
        const dateFormatter = new Intl.DateTimeFormat('es-ES', dateOptions);
        const timeFormatter = new Intl.DateTimeFormat('es-ES', timeOptions);

        const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

        const startText = `${cap(dateFormatter.format(start))} (${timeFormatter.format(start).toLowerCase()})`;

        // 🔥 BLINDAJE 3: Manejo seguro de la fecha de retorno (puede ser un viaje solo de ida)
        if (!endDateIso) {
            return `Salida: ${startText}`;
        }

        const end = new Date(endDateIso);
        if (isNaN(end.getTime())) return `Salida: ${startText}`;

        const endText = `${cap(dateFormatter.format(end))} (${timeFormatter.format(end).toLowerCase()})`;

        return `${startText} — ${endText}`;

    } catch (error) {
        console.error("Error formateando fechas:", error);
        return 'Fechas disponibles en detalle'; // Fallback elegante, nunca rompemos el UI
    }
};
