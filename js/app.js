function toggleMobileMenu() {
    const menu = document.getElementById('menuOpciones');
    if (!menu) return;
    menu.classList.toggle('activo');
}

function toggleTareasMenu() {
    const menu = document.getElementById('tareasMenuOpciones');
    if (!menu) return;
    menu.classList.toggle('activo');
}

document.addEventListener('click', event => {
    const navToggle = event.target.closest('#btn-hamburger');
    if (navToggle) {
        event.preventDefault();
        toggleMobileMenu();
    }

    const navLink = event.target.closest('#menuOpciones a');
    if (navLink) {
        const menu = document.getElementById('menuOpciones');
        if (menu) menu.classList.remove('activo');
    }

    const tareasToggle = event.target.closest('#btn-tareas-hamburger');
    if (tareasToggle) {
        event.preventDefault();
        toggleTareasMenu();
    }

    const tareasButton = event.target.closest('#tareasMenuOpciones button');
    if (!tareasButton) return;

    const map = {
        formulario: 'tarea-formulario',
        lista: 'tarea-lista',
        filtros: 'seccion-filtros'
    };

    const element = document.getElementById(map[tareasButton.dataset.target]);
    if (element) {
        element.classList.remove('d-none');
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        document.querySelectorAll('#tarea-formulario,#tarea-lista,#seccion-filtros').forEach(section => {
            if (section.id !== element.id && window.innerWidth < 992) {
                section.classList.add('d-none');
            }
        });
    }

    const menu = document.getElementById('tareasMenuOpciones');
    if (menu) menu.classList.remove('activo');
});

document.addEventListener('DOMContentLoaded', () => initTareas());

document.addEventListener("DOMContentLoaded", () => {
    aplicarTema();
    cargarComponente("nav-container",    "nav.html");
    cargarComponente("footer-container", "footer.html");
});

function initTareas() {
    const lista = document.getElementById('lista-tareas');
    if (!lista) return;

    const form = document.getElementById('form-tarea');
    const buscador = document.getElementById('buscador');
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroPrioridad = document.getElementById('filtro-prioridad');
    const btnLimpiar = document.getElementById('btn-limpiar');
    const mensajeFormulario = document.getElementById('mensaje-formulario');

    const KEY = 'tareas_app_tasks';
    const PRIORIDADES = ['Alta', 'Media', 'Baja'];

    function obtenerTareas() {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || [];
        } catch {
            return [];
        }
    }

    function guardarTareas(tareas) {
        localStorage.setItem(KEY, JSON.stringify(tareas));
    }

    function validarTarea(tarea) {
        if (!tarea.fecha) {
            return {
                ok: false,
                msg: 'La fecha es obligatoria.'
            };
        }

        if (!tarea.descripcion || tarea.descripcion.trim().length < 5) {
            return {
                ok: false,
                msg: 'La descripción debe tener al menos 5 caracteres.'
            };
        }

        if (!PRIORIDADES.includes(tarea.prioridad)) {
            return {
                ok: false,
                msg: 'Prioridad no válida.'
            };
        }

        return {
            ok: true
        };
    }

    function generarId() {
        return `tarea-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    function mostrarMensaje(texto, tipo = 'danger') {
        if (!mensajeFormulario) return;
        mensajeFormulario.innerHTML = `<div class="alert alert-${tipo} py-2">${escapeHtml(texto)}</div>`;
        setTimeout(() => {
            if (mensajeFormulario) mensajeFormulario.innerHTML = '';
        }, 3200);
    }

    function limpiarFormulario() {
        form.reset();
        document.getElementById('tarea-id').value = '';
        document.getElementById('btn-guardar').innerHTML = '<i class="bi bi-save me-1"></i> Guardar tarea';
    }

    function badgeColor(prioridad) {
        if (prioridad === 'Alta') return 'danger';
        if (prioridad === 'Media') return 'warning text-dark';
        return 'secondary';
    }

    function escapeHtml(text) {
        return String(text)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function render() {
        const tareas = obtenerTareas();
        const textoBusqueda = (buscador.value || '').toLowerCase();
        const estadoFilter = filtroEstado.value;
        const prioridadFilter = filtroPrioridad.value;

        const filtradas = tareas.filter(tarea => {
            if (estadoFilter !== 'todos' && tarea.estado !== estadoFilter) return false;
            if (prioridadFilter !== 'todas' && tarea.prioridad !== prioridadFilter) return false;
            if (!textoBusqueda) return true;
            return tarea.titulo.toLowerCase().includes(textoBusqueda) ||
                tarea.descripcion.toLowerCase().includes(textoBusqueda);
        }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        lista.innerHTML = '';

        if (filtradas.length === 0) {
            lista.innerHTML = '<div class="text-center text-white py-4">No hay tareas que mostrar.</div>';
            return;
        }

        filtradas.forEach(tarea => {
            const item = document.createElement('div');
            item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start flex-column flex-md-row gap-3';
            item.innerHTML = `
                <div class="flex-grow-1">
                    <div class="d-flex flex-column flex-sm-row justify-content-between gap-2 align-items-start align-items-sm-center mb-2">
                        <div>
                            <strong>${escapeHtml(tarea.titulo || 'Sin título')}</strong>
                            <span class="badge bg-${badgeColor(tarea.prioridad)} ms-2">${tarea.prioridad}</span>
                        </div>
                        <small class="text-muted">${new Date(tarea.fecha).toLocaleDateString()}</small>
                    </div>
                    <p class="mb-2 text-muted">${escapeHtml(tarea.descripcion)}</p>
                    <span class="badge ${tarea.estado === 'Completada' ? 'bg-success' : 'bg-secondary'}">${tarea.estado}</span>
                </div>
                <div class="d-flex gap-2 flex-wrap align-items-center">
                    <button type="button" class="btn btn-sm btn-outline-success" data-id="${tarea.id}" data-action="toggle" aria-label="Cambiar estado">
                        <i class="bi bi-toggle2-${tarea.estado === 'Completada' ? 'on' : 'off'} me-1"></i>${tarea.estado === 'Completada' ? 'Pendiente' : 'Completar'}
                    </button>
                    <button type="button" class="btn btn-sm btn-primary" data-id="${tarea.id}" data-action="editar" aria-label="Editar tarea">
                        <i class="bi bi-pencil-square me-1"></i>Editar
                    </button>
                    <button type="button" class="btn btn-sm btn-danger" data-id="${tarea.id}" data-action="borrar" aria-label="Eliminar tarea">
                        <i class="bi bi-trash me-1"></i>Borrar
                    </button>
                </div>
            `;
            lista.appendChild(item);
        });
    }

    lista.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button) return;

        const id = button.dataset.id;
        const action = button.dataset.action;
        const tareas = obtenerTareas();
        const index = tareas.findIndex(tarea => tarea.id === id);

        if (index === -1) return;

        if (action === 'borrar') {
            tareas.splice(index, 1);
            guardarTareas(tareas);
            render();
            mostrarMensaje('Tarea eliminada correctamente.', 'success');
            return;
        }

        if (action === 'editar') {
            const tarea = tareas[index];
            document.getElementById('tarea-id').value = tarea.id;
            document.getElementById('tarea-titulo').value = tarea.titulo;
            document.getElementById('tarea-descripcion').value = tarea.descripcion;
            document.getElementById('tarea-fecha').value = tarea.fecha;
            document.getElementById('tarea-prioridad').value = tarea.prioridad;
            document.getElementById('btn-guardar').innerHTML = '<i class="bi bi-save me-1"></i> Guardar cambios';
            return;
        }

        if (action === 'toggle') {
            tareas[index].estado = tareas[index].estado === 'Completada' ? 'Pendiente' : 'Completada';
            guardarTareas(tareas);
            render();
            return;
        }
    });

    form.addEventListener('submit', event => {
        event.preventDefault();

        const tarea = {
            id: document.getElementById('tarea-id').value || generarId(),
            titulo: document.getElementById('tarea-titulo').value.trim(),
            descripcion: document.getElementById('tarea-descripcion').value.trim(),
            fecha: document.getElementById('tarea-fecha').value,
            prioridad: document.getElementById('tarea-prioridad').value,
            estado: 'Pendiente'
        };

        const validacion = validarTarea(tarea);
        if (!validacion.ok) {
            mostrarMensaje(validacion.msg, 'danger');
            return;
        }

        const tareas = obtenerTareas();
        const index = tareas.findIndex(item => item.id === tarea.id);

        if (index === -1) {
            tareas.push(tarea);
        } else {
            tareas[index] = {
                ...tareas[index],
                ...tarea
            };
        }

        guardarTareas(tareas);
        limpiarFormulario();
        render();
        mostrarMensaje('Tarea guardada con éxito.', 'success');
    });

    buscador.addEventListener('input', render);
    filtroEstado.addEventListener('change', render);
    filtroPrioridad.addEventListener('change', render);
    btnLimpiar.addEventListener('click', () => {
        limpiarFormulario();
        if (mensajeFormulario) mensajeFormulario.innerHTML = '';
    });

    render();
}