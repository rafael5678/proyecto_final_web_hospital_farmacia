import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { Usuario, UsuarioRequest } from '../../models/usuario.model';
import { Cita } from '../../models/cita.model';
import { Reporte } from '../../models/reporte.model';
import { PortalSidebarComponent, SidebarItem } from '../portal-sidebar/portal-sidebar.component';
import { SessionTimeoutComponent } from '../session-timeout/session-timeout.component';
import { AiService } from '../../services/ai.service';
import { AiPreciosRequest, AiPreciosResponse } from '../../models/ai.model';

type AdminTab = 'inicio' | 'usuarios' | 'medicos' | 'citas' | 'reportes' | 'iasuperv' | 'preciosauditoria';
type AdminSub = '' | 'lista' | 'crear' | 'supervision' | 'resumen' | 'mensual';

@Component({
  selector: 'app-admin-portal',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, PortalSidebarComponent, SessionTimeoutComponent],
  templateUrl: './admin-portal.component.html',
  styleUrl: './admin-portal.component.css'
})
export class AdminPortalComponent implements OnInit {
  auth = inject(AuthService);
  private adminService = inject(AdminService);
  private ai = inject(AiService);

  tab = signal<AdminTab>('usuarios');
  sub = signal<AdminSub>('lista');
  expandedMenus = signal<string[]>(['usuarios', 'medicos', 'citas', 'reportes']);

  readonly menuItems: SidebarItem[] = [
    { id: 'inicio', label: 'Inicio', icon: '🏠', tab: 'inicio' },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: '👥',
      children: [
        { id: 'u-lista', label: 'Listar usuarios', tab: 'usuarios', sub: 'lista' },
        { id: 'u-crear', label: 'Registrar usuario', tab: 'usuarios', sub: 'crear' }
      ]
    },
    {
      id: 'medicos',
      label: 'Médicos',
      icon: '🩺',
      children: [
        { id: 'm-lista', label: 'Listar médicos', tab: 'medicos', sub: 'lista' },
        { id: 'm-crear', label: 'Registrar médico', tab: 'medicos', sub: 'crear' }
      ]
    },
    {
      id: 'citas',
      label: 'Citas',
      icon: '📅',
      children: [
        { id: 'c-super', label: 'Supervisión de citas', tab: 'citas', sub: 'supervision' }
      ]
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: '📊',
      children: [
        { id: 'r-resumen', label: 'Resumen general', tab: 'reportes', sub: 'resumen' },
        { id: 'r-mensual', label: 'Desglose mensual', tab: 'reportes', sub: 'mensual' }
      ]
    },
    {
      id: 'ia',
      label: 'Inteligencia Artificial',
      icon: '🤖',
      children: [
        { id: 'ia-superv', label: 'Supervisión IA', tab: 'iasuperv' },
        { id: 'ia-precios', label: 'Auditoría precios', tab: 'preciosauditoria' }
      ]
    }
  ];

  usuarios = signal<Usuario[]>([]);
  medicos = signal<Usuario[]>([]);
  citas = signal<Cita[]>([]);
  reporte = signal<Reporte | null>(null);

  form: UsuarioRequest = {
    nombre: '', email: '', password: '', rol: 'PACIENTE',
    telefono: '', documento: '', especialidad: ''
  };
  error = signal('');

  aiStatus = signal<{ apiKeyActiva: boolean; version: string } | null>(null);
  totalAnalisis = signal({ triage: 37, dermatologia: 12, soap: 84, interacciones: 56, precios: 41 });

  preciosReq: AiPreciosRequest = {
    medicamento: '',
    presentacion: '',
    precioReportado: 0,
    ciudad: 'Bogotá'
  };
  preciosPrecioTxt = '';
  preciosRsp = signal<AiPreciosResponse | null>(null);
  preciosLoading = signal(false);

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarMedicos();
    this.cargarCitas();
    this.cargarReportes();
    this.cargarAiStatus();
  }

  cargarAiStatus() {
    this.ai.status().subscribe({ next: s => this.aiStatus.set(s) });
  }

  onNavigate(item: SidebarItem) {
    if (!item.tab) return;
    this.tab.set(item.tab as AdminTab);
    this.sub.set((item.sub ?? '') as AdminSub);
    if (item.tab === 'reportes') this.cargarReportes();
    const group = this.menuItems.find(m => m.children?.some(c => c.id === item.id));
    if (group && !this.expandedMenus().includes(group.id)) {
      this.expandedMenus.set([...this.expandedMenus(), group.id]);
    }
  }

  onToggleGroup(id: string) {
    const list = this.expandedMenus();
    if (list.includes(id)) {
      this.expandedMenus.set(list.filter(x => x !== id));
    } else {
      this.expandedMenus.set([...list, id]);
    }
  }

  pageTitle(): string {
    const t = this.tab();
    const s = this.sub();
    const map: Record<string, string> = {
      inicio: 'Panel de inicio',
      'usuarios-lista': 'Usuarios — listado',
      'usuarios-crear': 'Usuarios — registrar',
      'medicos-lista': 'Médicos — listado',
      'medicos-crear': 'Médicos — registrar',
      'citas-supervision': 'Citas — supervisión',
      'reportes-resumen': 'Reportes — resumen',
      'reportes-mensual': 'Reportes — desglose mensual',
      iasuperv: 'IA — Supervisión y estado',
      preciosauditoria: 'IA — Auditoría de precios'
    };
    return map[`${t}-${s}`] ?? map[t] ?? 'Administración';
  }

  cargarUsuarios() {
    this.adminService.listarUsuarios().subscribe({ next: u => this.usuarios.set(u) });
  }

  cargarMedicos() {
    this.adminService.listarMedicos().subscribe({ next: m => this.medicos.set(m) });
  }

  cargarCitas() {
    this.adminService.supervisarCitas().subscribe({ next: c => this.citas.set(c) });
  }

  cargarReportes() {
    this.adminService.reportes().subscribe({ next: r => this.reporte.set(r) });
  }

  crearUsuario() {
    const req = { ...this.form };
    const obs = this.tab() === 'medicos'
      ? this.adminService.crearMedico({ ...req, rol: 'MEDICO' })
      : this.adminService.crearUsuario(req);
    obs.subscribe({
      next: () => {
        this.resetForm();
        this.cargarUsuarios();
        this.cargarMedicos();
        this.sub.set('lista');
      },
      error: (e) => this.error.set(e.error?.error ?? 'Error')
    });
  }

  desactivar(id: number) {
    this.adminService.desactivarUsuario(id).subscribe({ next: () => this.cargarUsuarios() });
  }

  idUsuario(u: Usuario): number {
    return u.usuarioId ?? u.id;
  }

  resetForm() {
    this.form = { nombre: '', email: '', password: '', rol: 'PACIENTE', telefono: '', documento: '', especialidad: '' };
    this.error.set('');
  }

  badgeClass(estado: string): string {
    return 'badge badge-' + estado.toLowerCase();
  }

  severidadSobreprecioColor(eval_: string): string {
    switch ((eval_ || '').toUpperCase()) {
      case 'SOBREPRECIO_ALTO':
      case 'DESABASTECIMIENTO_ARTIFICIAL': return 'bg-red';
      case 'SOBREPRECIO_BAJO': return 'bg-orange';
      case 'DENTRO_RANGO': return 'bg-green';
      default: return 'bg-blue';
    }
  }

  severidadSobreprecioLabel(eval_: string): string {
    switch ((eval_ || '').toUpperCase()) {
      case 'SOBREPRECIO_ALTO': return 'SOBREPRECIO ALTO';
      case 'DESABASTECIMIENTO_ARTIFICIAL': return 'DESABASTECIMIENTO ARTIFICIAL';
      case 'SOBREPRECIO_BAJO': return 'SOBREPRECIO BAJO';
      case 'DENTRO_RANGO': return 'DENTRO DE RANGO';
      default: return eval_ || '—';
    }
  }

  preciosAnalizar() {
    const precio = Number(this.preciosPrecioTxt);
    if (!this.preciosReq.medicamento.trim() || isNaN(precio) || precio <= 0) {
      this.error.set('Escriba el medicamento y un precio reportado positivo.');
      return;
    }
    this.error.set('');
    this.preciosReq.precioReportado = precio;
    this.preciosLoading.set(true);
    this.ai.precios(this.preciosReq).subscribe({
      next: r => this.preciosRsp.set(r),
      error: () => this.error.set('Error al analizar precios. Reintente.'),
      complete: () => this.preciosLoading.set(false)
    });
  }

}
