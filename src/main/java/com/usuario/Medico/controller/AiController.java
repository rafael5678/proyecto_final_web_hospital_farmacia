package com.usuario.Medico.controller;

import com.usuario.Medico.dto.*;
import com.usuario.Medico.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AiStatusResponse> status() {
        return ResponseEntity.ok(new AiStatusResponse(
                aiService.hayApiKey(),
                "Hospy AI v1.0 — Triage NLP / Dermatologia CNN / Escriba SOAP / Interacciones GNN / Precios IF+Prophet"
        ));
    }

    /* Pacientes y médicos pueden triagear */
    @PostMapping("/triage")
    @PreAuthorize("hasAnyRole('PACIENTE','MEDICO','ADMIN')")
    public ResponseEntity<AiTriageResponse> triage(@Valid @RequestBody AiTriageRequest req) {
        return ResponseEntity.ok(aiService.triage(req));
    }

    /* Pacientes y médicos pueden evaluar lesiones */
    @PostMapping("/dermatologia")
    @PreAuthorize("hasAnyRole('PACIENTE','MEDICO','ADMIN')")
    public ResponseEntity<AiDermatologiaResponse> dermatologia(@Valid @RequestBody AiDermatologiaRequest req) {
        return ResponseEntity.ok(aiService.dermatologia(req));
    }

    /* Solo médicos y admins pueden usar el escriba SOAP clínico */
    @PostMapping("/soap")
    @PreAuthorize("hasAnyRole('MEDICO','ADMIN')")
    public ResponseEntity<AiSoapResponse> soap(@Valid @RequestBody AiSoapRequest req) {
        return ResponseEntity.ok(aiService.soap(req));
    }

    /* Pacientes, médicos y admins pueden revisar interacciones */
    @PostMapping("/interacciones")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AiInteraccionResponse> interacciones(@Valid @RequestBody AiInteraccionRequest req) {
        return ResponseEntity.ok(aiService.interacciones(req));
    }

    /* Todos (autenticados) pueden triangular precios */
    @PostMapping("/precios")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AiPreciosResponse> precios(@Valid @RequestBody AiPreciosRequest req) {
        return ResponseEntity.ok(aiService.precios(req));
    }

    public record AiStatusResponse(boolean apiKeyActiva, String version) { }
}
