/**
 * Logger Utility
 * Substitui console.log para melhor controle de logs em produção
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
    /**
     * Debug logs - apenas em desenvolvimento
     */
    debug: (message: string, ...args: unknown[]) => {
        if (isDevelopment) {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    },

    /**
     * Info logs - sempre visível
     */
    info: (message: string, ...args: unknown[]) => {
        console.info(`[INFO] ${message}`, ...args);
    },

    /**
     * Warning logs - sempre visível
     */
    warn: (message: string, ...args: unknown[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    },

    /**
     * Error logs - sempre visível
     */
    error: (message: string, ...args: unknown[]) => {
        console.error(`[ERROR] ${message}`, ...args);
    },

    /**
     * Log de tabela - apenas em desenvolvimento
     */
    table: (data: unknown) => {
        if (isDevelopment && console.table) {
            console.table(data);
        }
    },
};

export default logger;
