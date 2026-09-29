import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  AiDermatologiaRequest, AiDermatologiaResponse,
  AiInteraccionRequest, AiInteraccionResponse,
  AiPreciosRequest, AiPreciosResponse,
  AiSoapRequest, AiSoapResponse,
  AiStatusResponse,
  AiTriageRequest, AiTriageResponse
} from '../models/ai.model';

const BASE = environment.apiUrl + '/ai';

@Injectable({ providedIn: 'root' })
export class AiService {
  private http = inject(HttpClient);

  status() {
    return this.http.get<AiStatusResponse>(`${BASE}/status`);
  }

  triage(req: AiTriageRequest) {
    return this.http.post<AiTriageResponse>(`${BASE}/triage`, req);
  }

  dermatologia(req: AiDermatologiaRequest) {
    return this.http.post<AiDermatologiaResponse>(`${BASE}/dermatologia`, req);
  }

  soap(req: AiSoapRequest) {
    const payload: AiSoapRequest = { ...req };
    if (!payload.transcripcionConsulta && payload.transcripcion) {
      payload.transcripcionConsulta = payload.transcripcion;
    }
    if (!payload.transcripcion && payload.transcripcionConsulta) {
      payload.transcripcion = payload.transcripcionConsulta;
    }
    return this.http.post<AiSoapResponse>(`${BASE}/soap`, payload);
  }

  interacciones(req: AiInteraccionRequest) {
    return this.http.post<AiInteraccionResponse>(`${BASE}/interacciones`, req);
  }

  precios(req: AiPreciosRequest) {
    return this.http.post<AiPreciosResponse>(`${BASE}/precios`, req);
  }
}
