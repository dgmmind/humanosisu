
    /**
    * ==========================================================================
    * SIMPLE NOTIFICATION SYSTEM - CLASE POO CON VARIABLES PRIVADAS
    * ==========================================================================
    */

    class SimpleNotificationSystem {
    // Variables privadas
    #container = null;
    #notifications = new Map();
    #currentTheme = 'light';
    #currentPosition = 'top'; // 'top' o 'bottom'
    #notificationId = 0;
    #prefix = 'dgm'; // Prefijo personalizable para clases CSS

    /**
     * Constructor - Inicializa el sistema
     * @param {Object} options - Configuración inicial
     */
    constructor(options = {}) {
    // Configurar prefijo si se proporciona
    if (options.prefix) {
    this.#prefix = options.prefix;
    this.#updateCSSPrefix();
}

    this.#init();
    this.#detectSystemTheme();
}

    /**
     * Inicialización del sistema
     * @private
     */
    #init() {
    this.#createContainer();
    this.#setupEventListeners();
}

    /**
     * Crea el contenedor principal
     * @private
     */
    #createContainer() {
    if (!this.#container) {
    this.#container = document.createElement('div');
    this.#container.className = `${this.#prefix}-notification-container ${this.#prefix}-position-${this.#currentPosition}`;
    document.body.appendChild(this.#container);
}
}

    /**
     * Configura event listeners
     * @private
     */
    #setupEventListeners() {
    // Detectar cambios en tema del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (this.#currentTheme === 'auto') {
    this.#applyTheme(e.matches ? 'dark' : 'light');
}
});
}

    /**
     * Detecta el tema del sistema
     * @private
     */
    #detectSystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark ? 'dark' : 'light');
}

    /**
     * Aplica un tema específico
     * @private
     */
    #applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

    /**
     * Actualiza el prefijo CSS (funcionalidad futura)
     * @private
     */
    #updateCSSPrefix() {
    // Aquí se podría implementar la actualización dinámica de prefijos CSS
    console.log(`Prefijo CSS configurado: ${this.#prefix}`);
}

    /**
     * Genera ID único para notificación
     * @private
     */
    #generateId() {
    return `${this.#prefix}-notification-${++this.#notificationId}-${Date.now()}`;
}

    /**
     * Obtiene ícono por defecto según el tipo
     * @private
     */
    #getDefaultIcon(type) {
    const icons = {
    success: '✓',
    danger: '✕',
    info: 'i'
};
    return icons[type] || icons.info;
}

    /**
     * Crea el elemento DOM de la notificación
     * @private
     */
    #createNotificationElement(options) {
    const notification = document.createElement('div');
    notification.className = `${this.#prefix}-notification ${this.#prefix}-${options.type}`;
    notification.id = options.id;

    // Crear ícono
    const icon = document.createElement('div');
    icon.className = `${this.#prefix}-notification-icon`;
    icon.textContent = options.icono || this.#getDefaultIcon(options.type);

    // Crear contenido
    const content = document.createElement('div');
    content.className = `${this.#prefix}-notification-content`;

    const title = document.createElement('div');
    title.className = `${this.#prefix}-notification-title`;
    title.textContent = options.titulo;
    content.appendChild(title);

    if (options.descripcion) {
    const description = document.createElement('div');
    description.className = `${this.#prefix}-notification-description`;
    description.textContent = options.descripcion;
    content.appendChild(description);
}

    // Crear acciones si es confirmación
    if (options.confirmacion) {
    const actions = this.#createConfirmationActions(options);
    content.appendChild(actions);
}

    // Crear botón cerrar
    const closeButton = document.createElement('button');
    closeButton.className = `${this.#prefix}-notification-close`;
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.remove(options.id);

    // Ensamblar elementos
    notification.appendChild(icon);
    notification.appendChild(content);
    notification.appendChild(closeButton);

    // Agregar barra de progreso si tiene tiempo
    if (options.tiempo > 0) {
    const progress = this.#createProgressBar(options);
    notification.appendChild(progress);
}

    return notification;
}

    /**
     * Crea las acciones de confirmación
     * @private
     */
    #createConfirmationActions(options) {
    const actions = document.createElement('div');
    actions.className = `${this.#prefix}-notification-actions`;

    // Botón de confirmación
    const confirmButton = document.createElement('button');
    confirmButton.className = `${this.#prefix}-notification-action ${this.#prefix}-danger`;
    confirmButton.textContent = options.confirmacion.textoSi || 'Confirmar';
    confirmButton.onclick = async () => {
    if (options.confirmacion.onConfirm) {
    try {
    await options.confirmacion.onConfirm();
} catch (error) {
    console.error('Error en confirmación:', error);
}
}
    this.remove(options.id);
};

    // Botón de cancelación
    const cancelButton = document.createElement('button');
    cancelButton.className = `${this.#prefix}-notification-action`;
    cancelButton.textContent = options.confirmacion.textoNo || 'Cancelar';
    cancelButton.onclick = () => {
    if (options.confirmacion.onCancel) {
    options.confirmacion.onCancel();
}
    this.remove(options.id);
};

    actions.appendChild(confirmButton);
    actions.appendChild(cancelButton);

    return actions;
}

    /**
     * Crea la barra de progreso
     * @private
     */
    #createProgressBar(options) {
    const progress = document.createElement('div');
    progress.className = `${this.#prefix}-notification-progress`;
    progress.style.transform = 'scaleX(1)';
    progress.style.transitionDuration = `${options.tiempo}ms`;

    // Iniciar animación
    setTimeout(() => {
    progress.style.transform = 'scaleX(0)';
}, 10);

    return progress;
}

    /**
     * Muestra una notificación
     * @public
     */
    show(options = {}) {
    // Configuración por defecto
    const defaultOptions = {
    type: 'info',
    titulo: 'Notificación',
    descripcion: null,
    tiempo: 5000,
    icono: null,
    theme: this.#currentTheme,
    confirmacion: null
};

    const finalOptions = { ...defaultOptions, ...options };
    finalOptions.id = this.#generateId();

    // Validar tipo
    if (!['success', 'danger', 'info'].includes(finalOptions.type)) {
    console.warn(`Tipo no válido: ${finalOptions.type}. Usando 'info'.`);
    finalOptions.type = 'info';
}

    // Aplicar tema si es diferente
    if (finalOptions.theme !== this.#currentTheme) {
    this.setTheme(finalOptions.theme);
}

    // Crear y mostrar elemento
    const element = this.#createNotificationElement(finalOptions);

    // Agregar al contenedor según posición
    if (this.#currentPosition === 'bottom') {
    this.#container.appendChild(element);
} else {
    this.#container.insertBefore(element, this.#container.firstChild);
}

    // Activar animación
    setTimeout(() => {
    element.classList.add(`${this.#prefix}-show`);
}, 10);

    // Auto-cerrar si tiene tiempo
    let timeout = null;
    if (finalOptions.tiempo > 0 && !finalOptions.confirmacion) {
    timeout = setTimeout(() => {
    this.remove(finalOptions.id);
}, finalOptions.tiempo);
}

    // Guardar datos
    this.#notifications.set(finalOptions.id, {
    element,
    timeout,
    options: finalOptions
});

    return finalOptions.id;
}

    /**
     * Cierra una notificación específica
     * @public
     */
    remove(id) {
    const notificationData = this.#notifications.get(id);
    if (!notificationData) return;

    const { element, timeout } = notificationData;

    // Limpiar timeout
    if (timeout) clearTimeout(timeout);

    // Animación de salida
    element.classList.remove(`${this.#prefix}-show`);

    // Aplicar animación según posición
    if (this.#currentPosition === 'bottom') {
    element.style.transform = 'translateY(100%)';
} else {
    element.style.transform = 'translateY(-100%)';
}
    element.style.opacity = '0';

    // Remover del DOM
    setTimeout(() => {
    if (element.parentNode) {
    element.parentNode.removeChild(element);
}
    this.#notifications.delete(id);
}, 300);
}

    /**
     * Cierra todas las notificaciones
     * @public
     */
    removeAll() {
    const ids = Array.from(this.#notifications.keys());
    ids.forEach(id => this.remove(id));
}

    /**
     * Establece el tema
     * @public
     */
    setTheme(theme) {
    const validThemes = ['light', 'dark', 'auto'];
    if (!validThemes.includes(theme)) {
    console.warn(`Tema no válido: ${theme}`);
    return;
}

    this.#currentTheme = theme;

    if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.#applyTheme(prefersDark ? 'dark' : 'light');
} else {
    this.#applyTheme(theme);
}
}

    /**
     * Establece la posición
     * @public
     */
    setPosition(position) {
    if (!['top', 'bottom'].includes(position)) {
    console.warn(`Posición no válida: ${position}`);
    return;
}

    this.#currentPosition = position;
    if (this.#container) {
    this.#container.className = `${this.#prefix}-notification-container ${this.#prefix}-position-${position}`;
}
}

    /**
     * Alterna el tema
     * @public
     */
    toggleTheme() {
    const newTheme = this.#currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
}

    /**
     * Alterna la posición
     * @public
     */
    togglePosition() {
    const newPosition = this.#currentPosition === 'top' ? 'bottom' : 'top';
    this.setPosition(newPosition);
}

    /**
     * Obtiene estadísticas
     * @public
     */
    getStats() {
    return {
    active: this.#notifications.size,
    theme: this.#currentTheme,
    position: this.#currentPosition,
    prefix: this.#prefix
};
}
}

    // ==========================================================================
    // INSTANCIA GLOBAL Y FUNCIONES
    // ==========================================================================

    // Crear instancia con prefijo personalizable
    const notificationSystem = new SimpleNotificationSystem({
    prefix: 'dgm' // Cambiar aquí para personalizar prefijo
});

    // Función global
    function showNotify(options) {
    return notificationSystem.show(options);
}

    // ==========================================================================
    // FUNCIONES DEMO
    // ==========================================================================

    function toggleTheme() {
    notificationSystem.toggleTheme();
}

    function togglePosition() {
    notificationSystem.togglePosition();
    showNotify({
    type: 'info',
    titulo: 'Posición cambiada',
    descripcion: `Ahora aparecen ${notificationSystem.getStats().position === 'top' ? 'arriba' : 'abajo'}`,
    tiempo: 3000
});
}

    function clearAll() {
    notificationSystem.removeAll();
}

    function showSuccess() {
    showNotify({
        type: 'success',
        titulo: '¡Operación exitosa!',
        descripcion: 'La acción se completó correctamente.',
        tiempo: 4000,
        icono: '✅'
    });
}

    function showDanger() {
    showNotify({
        type: 'danger',
        titulo: 'Error crítico',
        descripcion: 'Algo salió mal en el proceso.',
        tiempo: 6000,
        icono: '❌'
    });
}

    function showInfo() {
    showNotify({
        type: 'info',
        titulo: 'Información importante',
        descripcion: 'Hay una actualización disponible.',
        tiempo: 5000,
        icono: 'ℹ️'
    });
}

    function showDeleteConfirm() {
    showNotify({
        type: 'danger',
        titulo: '¿Eliminar elemento?',
        descripcion: 'Esta acción no se puede deshacer.',
        tiempo: 0, // No auto-cerrar
        icono: '🗑️',
        confirmacion: {
            textoSi: 'Sí, eliminar',
            textoNo: 'Cancelar',
            onConfirm: async () => {
                // Simular fetch de eliminación
                console.log('Ejecutando eliminación...');
                await new Promise(resolve => setTimeout(resolve, 1000));

                showNotify({
                    type: 'success',
                    titulo: 'Elemento eliminado',
                    descripcion: 'El elemento se eliminó correctamente.',
                    tiempo: 3000
                });
            },
            onCancel: () => {
                console.log('Eliminación cancelada');
            }
        }
    });
}

    function showSaveConfirm() {
    showNotify({
        type: 'info',
        titulo: '¿Guardar cambios?',
        descripcion: 'Se guardarán todos los cambios realizados.',
        tiempo: 0,
        icono: '💾',
        confirmacion: {
            textoSi: 'Guardar',
            textoNo: 'Descartar',
            onConfirm: async () => {
                console.log('Guardando...');
                // Simular fetch de guardado
                await fetch('/api/save', {
                    method: 'POST',
                    body: JSON.stringify({ data: 'ejemplo' }),
                    headers: { 'Content-Type': 'application/json' }
                }).catch(() => console.log('Simulando guardado...'));

                showNotify({
                    type: 'success',
                    titulo: 'Cambios guardados',
                    descripcion: 'Todos los cambios se guardaron exitosamente.',
                    tiempo: 3000
                });
            }
        }
    });
}

    function showLogoutConfirm() {
    showNotify({
        type: 'info',
        titulo: '¿Cerrar sesión?',
        descripcion: 'Se cerrará tu sesión actual.',
        tiempo: 0,
        icono: '🚪',
        confirmacion: {
            textoSi: 'Cerrar sesión',
            textoNo: 'Cancelar',
            onConfirm: async () => {
                console.log('Cerrando sesión...');
                // Simular logout
                await new Promise(resolve => setTimeout(resolve, 500));

                showNotify({
                    type: 'info',
                    titulo: 'Sesión cerrada',
                    descripcion: 'Has cerrado sesión correctamente.',
                    tiempo: 2000
                });
            }
        }
    });
}

    // Hacer disponible globalmente
    window.SimpleNotificationSystem = SimpleNotificationSystem;
    window.showNotify = showNotify;

    // Notificación de bienvenida
    document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        showNotify({
            type: 'success',
            titulo: '¡System Waiting!',
            descripcion: 'Welcome To HumanoSisu.',
            tiempo: 4000,
            icono: '🚀'
        });
    }, 500);
});
