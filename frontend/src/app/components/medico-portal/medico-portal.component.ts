import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MedicoService, MedicoDashboard, MedicoPerfil } from '../../services/medico.service';
import { Cita } from '../../models/cita.model';
import { Horario } from '../../models/horario.model';
import { PacientePerfil } from '../../models/paciente-perfil.model';
import { PortalSidebarComponent, SidebarItem } from '../portal-sidebar/portal-sidebar.component';
import { SessionTimeoutComponent } from '../session-timeout/session-timeout.component';
import { AiService } from '../../services/ai.service';
import {
  AiSoapRequest, AiSoapResponse,
  AiPreciosRequest, AiPreciosResponse, ComparativaFarmacia
} from '../../models/ai.model';

type MedicoTab = 'inicio' | 'citas' | 'horarios' | 'paciente' | 'soap' | 'precios';
type MedicoSub = '' | 'todas' | 'pendientes' | 'aceptadas' | 'lista' | 'agregar';

@Component({
  selector: 'app-medico-portal',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, PortalSidebarComponent, SessionTimeoutComponent],
  templateUrl: './medico-portal.component.html',
  styleUrl: './medico-portal.component.css'
})
export class MedicoPortalComponent implements OnInit {
  auth = inject(AuthService);
  private svc = inject(MedicoService);
  private ai = inject(AiService);

  tab = signal<MedicoTab>('inicio');
  sub = signal<MedicoSub>('');
  expandedMenus = signal<string[]>(['citas', 'horarios']);

  readonly baseMenu: SidebarItem[] = [
    { id: 'inicio', label: 'Inicio', icon: '🏠', tab: 'inicio' },
    {
      id: 'citas',
      label: 'Citas',
      icon: '📅',
      children: [
        { id: 'c-todas', label: 'Todas las citas', tab: 'citas', sub: 'todas' },
        { id: 'c-pend', label: 'Pendientes', tab: 'citas', sub: 'pendientes' },
        { id: 'c-acep', label: 'Aceptadas', tab: 'citas', sub: 'aceptadas' }
      ]
    },
    {
      id: 'horarios',
      label: 'Horarios',
      icon: '🕐',
      children: [
        { id: 'h-lista', label: 'Mis horarios', tab: 'horarios', sub: 'lista' },
        { id: 'h-agregar', label: 'Agregar horario', tab: 'horarios', sub: 'agregar' }
      ]
    },
    {
      id: 'ia',
      label: 'IA Hospitalaria',
      icon: '🤖',
      children: [
        { id: 'ia-soap', label: 'Escriba SOAP', tab: 'soap' }
      ]
    },
    {
      id: 'meds',
      label: 'Medicamentos',
      icon: '💊',
      children: [
        { id: 'meds-precios', label: 'Triangular precios', tab: 'precios' }
      ]
    }
  ];

  menuItems = computed(() => {
    const items = [...this.baseMenu];
    if (this.pacienteSeleccionado()) {
      items.push({ id: 'paciente', label: 'Ficha paciente', icon: '📋', tab: 'paciente' });
    }
    return items;
  });

  dashboard = signal<MedicoDashboard | null>(null);
  perfil = signal<MedicoPerfil | null>(null);
  citas = signal<Cita[]>([]);
  horarios = signal<Horario[]>([]);
  pacienteSeleccionado = signal<PacientePerfil | null>(null);

  diaSemana = 1;
  horaInicio = '08:00';
  horaFin = '12:00';
  error = signal('');

  soapReq: AiSoapRequest = {
    nombrePaciente: '',
    motivoInicial: '',
    transcripcion: ''
  };
  soapRsp = signal<AiSoapResponse | null>(null);
  soapLoading = signal(false);

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
    this.cargarInicio();
    this.cargarCitas();
    this.cargarHorarios();
    this.svc.perfil().subscribe({ next: p => this.perfil.set(p) });
  }

  onNavigate(item: SidebarItem) {
    if (!item.tab) return;
    this.tab.set(item.tab as MedicoTab);
    this.sub.set((item.sub ?? '') as MedicoSub);
    if (item.tab === 'citas') this.applyFiltroFromSub(item.sub);
    const group = this.baseMenu.find(m => m.children?.some(c => c.id === item.id));
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

  private applyFiltroFromSub(sub?: string) {
    if (sub === 'pendientes') this.filtroEstado = 'PENDIENTE';
    else if (sub === 'aceptadas') this.filtroEstado = 'ACEPTADA';
    else this.filtroEstado = '';
  }

  filtroEstado = '';

  pageTitle(): string {
    const map: Record<string, string> = {
      inicio: 'Panel médico',
      'citas-todas': 'Citas — todas',
      'citas-pendientes': 'Citas — pendientes',
      'citas-aceptadas': 'Citas — aceptadas',
      'horarios-lista': 'Horarios — listado',
      'horarios-agregar': 'Horarios — agregar',
      paciente: 'Ficha del paciente',
      soap: 'IA — Escriba médico SOAP',
      precios: 'IA — Triangulación de precios'
    };
    const key = this.sub() ? `${this.tab()}-${this.sub()}` : this.tab();
    return map[key] ?? 'Portal médico';
  }

  cargarInicio() {
    this.svc.dashboard().subscribe({ next: d => this.dashboard.set(d) });
  }

  citasFiltradas(): Cita[] {
    if (!this.filtroEstado) return this.citas();
    return this.citas().filter(c => c.estado === this.filtroEstado);
  }

  cargarCitas() {
    this.svc.misCitas().subscribe({
      next: c => this.citas.set(c),
      error: () => this.error.set('Error al cargar citas')
    });
  }

  cargarHorarios() {
    this.svc.misHorarios().subscribe({ next: h => this.horarios.set(h) });
  }

  aceptar(id: number) {
    this.svc.aceptar(id).subscribe({ next: () => { this.cargarCitas(); this.cargarInicio(); } });
  }

  rechazar(id: number) {
    this.svc.rechazar(id).subscribe({ next: () => { this.cargarCitas(); this.cargarInicio(); } });
  }

  verPaciente(citaId: number) {
    this.svc.verPaciente(citaId).subscribe({
      next: p => {
        this.pacienteSeleccionado.set(p);
        this.tab.set('paciente');
        this.sub.set('');
      }
    });
  }

  agregarHorario() {
    this.svc.crearHorario({
      diaSemana: this.diaSemana,
      horaInicio: this.horaInicio,
      horaFin: this.horaFin,
      disponible: true
    }).subscribe({
      next: () => {
        this.cargarHorarios();
        this.cargarInicio();
        this.sub.set('lista');
        this.tab.set('horarios');
      }
    });
  }

  eliminarHorario(id: number) {
    this.svc.eliminarHorario(id).subscribe({ next: () => this.cargarHorarios() });
  }

  badgeClass(estado: string): string {
    return 'badge badge-' + estado.toLowerCase();
  }

  soapGenerar() {
    const tx = (this.soapReq.transcripcion || this.soapReq.transcripcionConsulta || '').trim();
    if (!tx) {
      this.error.set('Escriba o pegue la transcripción de la consulta.');
      return;
    }
    this.soapReq.transcripcion = tx;
    this.soapReq.transcripcionConsulta = tx;
    this.error.set('');
    this.soapLoading.set(true);
    this.ai.soap(this.soapReq).subscribe({
      next: r => this.soapRsp.set(r),
      error: () => this.error.set('Error al generar SOAP. Reintente.'),
      complete: () => this.soapLoading.set(false)
    });
  }

  preciosAnalizar() {
    const precio = Number(this.preciosPrecioTxt);
    if (!this.preciosReq.medicamento.trim() || isNaN(precio) || precio <= 0) {
      this.error.set('Escriba el medicamento y un precio positivo.');
      return;
    }
    this.error.set('');
    this.preciosReq.precioReportado = precio;
    this.preciosLoading.set(true);
    this.ai.precios(this.preciosReq).subscribe({
      next: r => this.preciosRsp.set(r),
      error: () => this.error.set('Error al triangular precios. Reintente.'),
      complete: () => this.preciosLoading.set(false)
    });
  }

  severidadColor(sev?: string): string {
    switch ((sev || '').toUpperCase()) {
      case 'ALTO': return 'bg-red';
      case 'MEDIO': return 'bg-orange';
      case 'BAJO': return 'bg-green';
      default: return 'bg-blue';
    }
  }

}
