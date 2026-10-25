// =============================================
// COMENTARIOS — botón flotante disponible en todas las pantallas
// Guarda el texto en la tabla "Comentario"
// =============================================

let guardandoComentario = false;

function pantallaActual() {
  const app = document.getElementById('app-screen');
  return app && !app.classList.contains('hidden') ? App.currentPage : 'login';
}

function actualizarContadorComentario() {
  const n = document.getElementById('com-texto').value.length;
  document.getElementById('com-contador').textContent = `${n} / 1000`;
}

function abrirComentarios() {
  document.getElementById('com-form').reset();
  actualizarContadorComentario();
  openModal('modal-comentarios');
  document.getElementById('com-texto').focus();
}

document.getElementById('com-texto').addEventListener('input', actualizarContadorComentario);

document.getElementById('com-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (guardandoComentario) return;

  const texto = document.getElementById('com-texto').value.trim();
  if (!texto) { toast('Escribe un comentario antes de guardar', 'warning'); return; }

  const btn = document.getElementById('com-guardar');
  guardandoComentario = true;
  btn.disabled = true;

  const { error } = await db.from('Comentario').insert({
    nombre: document.getElementById('com-nombre').value.trim() || null,
    texto,
    pantalla: pantallaActual(),
    id_usuario: App.currentUser?.id_usuario ?? null,
  });

  guardandoComentario = false;
  btn.disabled = false;

  if (error) { toast('No se pudo guardar el comentario: ' + error.message, 'error'); return; }
  toast('Comentario guardado', 'success');
  closeModal('modal-comentarios');
});

// ========== VER COMENTARIOS ==========
const NOMBRES_PANTALLA = {
  login: 'Login', dashboard: 'Panel Principal', productos: 'Productos', categorias: 'Categorías',
  proveedores: 'Proveedores', clientes: 'Clientes', 'nueva-venta': 'Nueva Venta', ventas: 'Historial',
  facturacion: 'Facturación', alertas: 'Alertas', usuarios: 'Usuarios',
};

function escaparHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function abrirListaComentarios() {
  closeModal('modal-comentarios');
  const tbody = document.getElementById('com-lista-tbody');
  tbody.innerHTML = '<tr><td colspan="3"><div class="loader"><div class="spinner"></div></div></td></tr>';
  openModal('modal-lista-comentarios');

  const { data, error } = await db.from('Comentario')
    .select('nombre, pantalla, texto')
    .order('fecha_creacion', { ascending: false })
    .limit(200);

  if (error) {
    tbody.innerHTML = '<tr><td colspan="3">No se pudieron cargar los comentarios.</td></tr>';
    return;
  }
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="3"><div class="empty-state"><span class="emoji">💬</span><p>Aún no hay comentarios</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = data.map(c => `
    <tr>
      <td><strong>${escaparHtml(c.nombre) || 'Anónimo'}</strong></td>
      <td><span class="badge badge-orange">${escaparHtml(NOMBRES_PANTALLA[c.pantalla] || c.pantalla || '—')}</span></td>
      <td style="white-space:pre-wrap">${escaparHtml(c.texto)}</td>
    </tr>
  `).join('');
}
