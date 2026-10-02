# Datasets Hospy (plan de uso)

Hoy la IA usa subconjuntos locales en el backend (`src/main/resources/datasets`), más un clasificador de piel entrenado con ~925 fotos (8 enfermedades: celulitis, impétigo, pie de atleta, hongo de uña, tiña, larva migrans, varicela y herpes zóster).
Mañana: Apache Spark para descargar y unificar fuentes abiertas (no PhysioNet/MIMIC hasta tener licencia).

## Listos para descarga abierta (Spark)

| Módulo | Fuente | URL | Notas |
|---|---|---|---|
| Triage NLP | MedMCQA | https://huggingface.co/datasets/openlifescienceai/medmcqa | Apache 2.0 |
| Triage NLP | MedQA | https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options | Preguntas clínicas |
| Triage ES | SympTEMIST | https://zenodo.org/records/10635215 | Español + SNOMED |
| Piel | PAD-UFES-20 | https://data.mendeley.com/datasets/zr7vgbcyr2 | Imágenes + metadatos |
| Piel | HAM10000 | https://doi.org/10.7910/DVN/DBW86T | No comercial |
| Piel | ISIC | https://challenge.isic-archive.com/data | Registro del reto |
| Alimentos | FooDB | https://foodb.ca/downloads | Sin login |
| Metabolitos | HMDB | https://hmdb.ca/downloads | v5.0 |
| Moléculas | ChEMBL | https://www.ebi.ac.uk/chembl/ | Fármacos, no triage |
| Precios CO | SISMED / datos.gov.co | https://www.datos.gov.co | CUM vigentes |

## Requieren cuenta o acuerdo (no automatizar)

- MIMIC-IV-ED: PhysioNet + curso + DUA. Demo: https://www.physionet.org/content/mimic-iv-ed-demo/
- DrugBank: licencia académica
- Derm7pt: https://derm.cs.sfu.ca/Welcome.html
- BioBERT / BiomedBERT: modelos HF, no datasets de síntomas

## No usar

- DermNet NZ (atlas con copyright, no dataset)
- SIMON / Precio País (nombres incorrectos; usar SISMED)
- Scraping de droguerías sin términos claros
