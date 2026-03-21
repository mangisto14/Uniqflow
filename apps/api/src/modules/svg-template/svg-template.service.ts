import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSvgTemplateDto } from './dto/create-svg-template.dto';
import { UpdateSvgTemplateDto } from './dto/update-svg-template.dto';

// ── Built-in SVG content ──────────────────────────────────────────────────────

const PICKUP_TRUCK_SVG = `<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <line x1="20" y1="172" x2="500" y2="172" stroke="#e2e8f0" stroke-width="1.5"/>
  <rect x="42" y="80" width="155" height="58" rx="2" fill="#f1f5f9" stroke="#475569" stroke-width="1.8"/>
  <rect x="42" y="74" width="156" height="9" rx="2" fill="#dde3ec" stroke="#475569" stroke-width="1.8"/>
  <rect x="42" y="74" width="9" height="64" rx="1" fill="#dde3ec" stroke="#475569" stroke-width="1.8"/>
  <rect x="72" y="74" width="7" height="6" rx="1" fill="#8fa3b8"/>
  <rect x="101" y="74" width="7" height="6" rx="1" fill="#8fa3b8"/>
  <rect x="130" y="74" width="7" height="6" rx="1" fill="#8fa3b8"/>
  <rect x="159" y="74" width="7" height="6" rx="1" fill="#8fa3b8"/>
  <rect x="197" y="72" width="9" height="66" rx="1" fill="#c8d3de" stroke="#475569" stroke-width="1.5"/>
  <rect x="206" y="90" width="188" height="48" rx="2" fill="#f1f5f9" stroke="#475569" stroke-width="1.8"/>
  <path d="M 218 90 C 220 60 250 43 314 40 C 364 38 393 53 394 90" fill="#dde3ec" stroke="#475569" stroke-width="1.8"/>
  <path d="M 230 88 C 234 62 260 46 316 43 C 363 41 388 56 388 88" fill="#c8e1f8" stroke="#85b8e8" stroke-width="1.2" opacity="0.9"/>
  <rect x="214" y="93" width="52" height="26" rx="3" fill="#c8e1f8" stroke="#85b8e8" stroke-width="1.2" opacity="0.9"/>
  <rect x="272" y="93" width="60" height="26" rx="3" fill="#c8e1f8" stroke="#85b8e8" stroke-width="1.2" opacity="0.9"/>
  <rect x="270" y="90" width="5" height="48" rx="1" fill="#c8d3de"/>
  <rect x="252" y="112" width="14" height="4" rx="2" fill="#94a3b8"/>
  <rect x="346" y="112" width="14" height="4" rx="2" fill="#94a3b8"/>
  <path d="M 392 76 L 412 71 L 414 82 L 392 84 Z" fill="#dde3ec" stroke="#475569" stroke-width="1.5"/>
  <path d="M 394 55 L 440 61 L 456 90 L 394 90 Z" fill="#dde3ec" stroke="#475569" stroke-width="1.8"/>
  <line x1="394" y1="73" x2="453" y2="76" stroke="#b0bcc8" stroke-width="1"/>
  <rect x="448" y="100" width="16" height="38" rx="3" fill="#c8d3de" stroke="#475569" stroke-width="1.8"/>
  <rect x="443" y="97" width="15" height="24" rx="2" fill="#b0bcc8" stroke="#475569" stroke-width="1.5"/>
  <line x1="443" y1="106" x2="458" y2="106" stroke="#8899aa" stroke-width="1"/>
  <line x1="443" y1="114" x2="458" y2="114" stroke="#8899aa" stroke-width="1"/>
  <rect x="441" y="84" width="14" height="11" rx="2" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
  <path d="M 432 90 Q 450 88, 465 100" fill="none" stroke="#475569" stroke-width="1.5"/>
  <rect x="40" y="82" width="6" height="14" rx="1" fill="#fca5a5" stroke="#dc2626" stroke-width="1.5"/>
  <rect x="40" y="98" width="6" height="10" rx="1" fill="#fdba74" stroke="#ea580c" stroke-width="1.5"/>
  <rect x="31" y="110" width="12" height="28" rx="2" fill="#c8d3de" stroke="#475569" stroke-width="1.8"/>
  <rect x="24" y="128" width="10" height="6" rx="1" fill="#6b7f94"/>
  <circle cx="26" cy="131" r="3.5" fill="#475569"/>
  <rect x="110" y="138" width="196" height="7" rx="3" fill="#c8d3de" stroke="#94a3b8" stroke-width="1"/>
  <path d="M 80 138 Q 78 108 118 106 Q 158 104 158 138" fill="none" stroke="#475569" stroke-width="2"/>
  <path d="M 330 138 Q 328 108 368 106 Q 408 104 408 138" fill="none" stroke="#475569" stroke-width="2"/>
  <line x1="44" y1="138" x2="82" y2="138" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="156" y1="138" x2="332" y2="138" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="406" y1="138" x2="446" y2="138" stroke="#94a3b8" stroke-width="2.5"/>
  <circle cx="118" cy="150" r="30" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <circle cx="118" cy="150" r="22" fill="#1e293b"/>
  <circle cx="118" cy="150" r="13" fill="#475569"/>
  <circle cx="118" cy="135" r="3.5" fill="#64748b"/><circle cx="132" cy="139" r="3.5" fill="#64748b"/>
  <circle cx="133" cy="154" r="3.5" fill="#64748b"/><circle cx="125" cy="165" r="3.5" fill="#64748b"/>
  <circle cx="111" cy="165" r="3.5" fill="#64748b"/><circle cx="103" cy="154" r="3.5" fill="#64748b"/>
  <circle cx="104" cy="139" r="3.5" fill="#64748b"/>
  <circle cx="368" cy="150" r="30" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <circle cx="368" cy="150" r="22" fill="#1e293b"/>
  <circle cx="368" cy="150" r="13" fill="#475569"/>
  <circle cx="368" cy="135" r="3.5" fill="#64748b"/><circle cx="382" cy="139" r="3.5" fill="#64748b"/>
  <circle cx="383" cy="154" r="3.5" fill="#64748b"/><circle cx="375" cy="165" r="3.5" fill="#64748b"/>
  <circle cx="361" cy="165" r="3.5" fill="#64748b"/><circle cx="353" cy="154" r="3.5" fill="#64748b"/>
  <circle cx="354" cy="139" r="3.5" fill="#64748b"/>
</svg>`;

const PERSON_BODY_SVG = `<svg viewBox="0 0 160 340" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <ellipse cx="80" cy="36" rx="26" ry="30" fill="#fde8c8" stroke="#475569" stroke-width="1.8"/>
  <path d="M 55 28 Q 58 4 80 4 Q 102 4 105 28 Q 98 14 80 13 Q 62 14 55 28 Z" fill="#6b4c3b"/>
  <path d="M 54 35 Q 49 40 51 49 Q 53 55 57 51" fill="#fde8c8" stroke="#475569" stroke-width="1.5"/>
  <path d="M 106 35 Q 111 40 109 49 Q 107 55 103 51" fill="#fde8c8" stroke="#475569" stroke-width="1.5"/>
  <ellipse cx="71" cy="33" rx="5" ry="4" fill="white" stroke="#334155" stroke-width="1"/>
  <circle cx="71" cy="33" r="2.5" fill="#1e293b"/>
  <ellipse cx="89" cy="33" rx="5" ry="4" fill="white" stroke="#334155" stroke-width="1"/>
  <circle cx="89" cy="33" r="2.5" fill="#1e293b"/>
  <path d="M 65 27 Q 71 24 77 27" fill="none" stroke="#5a3e2b" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 83 27 Q 89 24 95 27" fill="none" stroke="#5a3e2b" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 80 38 L 77 48 Q 80 51 83 48 L 80 38" fill="#f0c898" stroke="#c8956c" stroke-width="0.8"/>
  <path d="M 73 56 Q 80 61 87 56" fill="none" stroke="#9b5e44" stroke-width="1.5" stroke-linecap="round"/>
  <rect x="74" y="65" width="12" height="18" rx="5" fill="#fde8c8" stroke="#475569" stroke-width="1.5"/>
  <path d="M 74 83 L 40 88 L 24 100 L 30 110 L 46 102 L 114 102 L 130 110 L 136 100 L 120 88 L 86 83 Z" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
  <path d="M 74 83 L 80 95 L 86 83" fill="#2563eb" stroke="#1d4ed8" stroke-width="1"/>
  <rect x="30" y="102" width="100" height="80" rx="3" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
  <path d="M 30 108 Q 14 122 10 148 Q 8 172 12 196" fill="none" stroke="#fde8c8" stroke-width="20" stroke-linecap="round"/>
  <path d="M 30 108 Q 14 122 10 148 Q 8 172 12 196" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 130 108 Q 146 122 150 148 Q 152 172 148 196" fill="none" stroke="#fde8c8" stroke-width="20" stroke-linecap="round"/>
  <path d="M 130 108 Q 146 122 150 148 Q 152 172 148 196" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
  <ellipse cx="12" cy="204" rx="10" ry="13" fill="#fde8c8" stroke="#475569" stroke-width="1.5"/>
  <ellipse cx="148" cy="204" rx="10" ry="13" fill="#fde8c8" stroke="#475569" stroke-width="1.5"/>
  <rect x="30" y="182" width="100" height="80" rx="2" fill="#1e3a5f" stroke="#172554" stroke-width="1.5"/>
  <rect x="30" y="182" width="100" height="10" rx="1" fill="#92400e"/>
  <rect x="73" y="181" width="14" height="12" rx="1" fill="#b45309"/>
  <line x1="80" y1="192" x2="80" y2="262" stroke="#172554" stroke-width="1.5"/>
  <path d="M 30 262 Q 30 295 32 318 L 54 318 Q 54 295 54 262 Z" fill="#1e3a5f" stroke="#172554" stroke-width="1.5"/>
  <path d="M 106 262 Q 106 295 108 318 L 130 318 Q 130 295 126 262 Z" fill="#1e3a5f" stroke="#172554" stroke-width="1.5"/>
  <path d="M 28 315 Q 22 320 20 328 Q 20 335 34 337 Q 52 338 56 330 L 54 315 Z" fill="#1c1917" stroke="#0c0a09" stroke-width="1.5"/>
  <path d="M 132 315 Q 138 320 140 328 Q 140 335 126 337 Q 108 338 104 330 L 108 315 Z" fill="#1c1917" stroke="#0c0a09" stroke-width="1.5"/>
</svg>`;

const SEDAN_CAR_SVG = `<svg viewBox="0 0 480 165" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <line x1="20" y1="158" x2="460" y2="158" stroke="#e2e8f0" stroke-width="1.5"/>
  <rect x="48" y="90" width="384" height="50" rx="4" fill="#f1f5f9" stroke="#475569" stroke-width="1.8"/>
  <path d="M 110 90 C 120 60 148 45 180 42 L 298 42 C 330 42 358 55 370 90" fill="#dde3ec" stroke="#475569" stroke-width="1.8"/>
  <path d="M 122 88 C 132 62 156 47 184 44 L 298 44 C 324 48 346 62 356 88" fill="#c8e1f8" stroke="#85b8e8" stroke-width="1.2" opacity="0.9"/>
  <rect x="230" y="92" width="72" height="26" rx="3" fill="#c8e1f8" stroke="#85b8e8" stroke-width="1.2" opacity="0.9"/>
  <rect x="148" y="92" width="76" height="26" rx="3" fill="#c8e1f8" stroke="#85b8e8" stroke-width="1.2" opacity="0.9"/>
  <path d="M 110 88 C 115 70 132 57 148 55 L 148 92 L 130 90 Z" fill="#c8e1f8" stroke="#85b8e8" stroke-width="1.2" opacity="0.9"/>
  <rect x="145" y="90" width="5" height="50" rx="1" fill="#c8d3de"/>
  <rect x="228" y="90" width="5" height="50" rx="1" fill="#c8d3de"/>
  <rect x="308" y="90" width="5" height="50" rx="1" fill="#c8d3de"/>
  <rect x="170" y="112" width="14" height="4" rx="2" fill="#94a3b8"/>
  <rect x="256" y="112" width="14" height="4" rx="2" fill="#94a3b8"/>
  <path d="M 370 72 L 410 80 L 424 90 L 370 90 Z" fill="#dde3ec" stroke="#475569" stroke-width="1.8"/>
  <path d="M 368 79 L 388 74 L 390 84 L 368 86 Z" fill="#dde3ec" stroke="#475569" stroke-width="1.5"/>
  <rect x="414" y="98" width="18" height="42" rx="4" fill="#c8d3de" stroke="#475569" stroke-width="1.8"/>
  <rect x="405" y="90" width="18" height="10" rx="2.5" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
  <rect x="415" y="104" width="16" height="18" rx="2" fill="#b0bcc8" stroke="#475569" stroke-width="1"/>
  <line x1="415" y1="110" x2="431" y2="110" stroke="#8899aa" stroke-width="1"/>
  <line x1="415" y1="116" x2="431" y2="116" stroke="#8899aa" stroke-width="1"/>
  <path d="M 110 72 L 72 80 L 56 90 L 110 90 Z" fill="#dde3ec" stroke="#475569" stroke-width="1.8"/>
  <rect x="49" y="90" width="8" height="14" rx="1.5" fill="#fca5a5" stroke="#dc2626" stroke-width="1.5"/>
  <rect x="49" y="106" width="8" height="10" rx="1.5" fill="#fdba74" stroke="#ea580c" stroke-width="1.5"/>
  <rect x="42" y="100" width="12" height="40" rx="3" fill="#c8d3de" stroke="#475569" stroke-width="1.8"/>
  <path d="M 74 140 Q 72 110 112 108 Q 152 106 152 140" fill="none" stroke="#475569" stroke-width="2"/>
  <path d="M 312 140 Q 310 110 350 108 Q 390 106 390 140" fill="none" stroke="#475569" stroke-width="2"/>
  <line x1="50" y1="140" x2="76" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="150" y1="140" x2="314" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="388" y1="140" x2="422" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <circle cx="112" cy="148" r="26" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <circle cx="112" cy="148" r="19" fill="#1e293b"/><circle cx="112" cy="148" r="11" fill="#475569"/>
  <circle cx="112" cy="134" r="3" fill="#64748b"/><circle cx="124" cy="138" r="3" fill="#64748b"/>
  <circle cx="125" cy="152" r="3" fill="#64748b"/><circle cx="118" cy="162" r="3" fill="#64748b"/>
  <circle cx="106" cy="162" r="3" fill="#64748b"/><circle cx="99" cy="152" r="3" fill="#64748b"/>
  <circle cx="100" cy="138" r="3" fill="#64748b"/>
  <circle cx="350" cy="148" r="26" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <circle cx="350" cy="148" r="19" fill="#1e293b"/><circle cx="350" cy="148" r="11" fill="#475569"/>
  <circle cx="350" cy="134" r="3" fill="#64748b"/><circle cx="362" cy="138" r="3" fill="#64748b"/>
  <circle cx="363" cy="152" r="3" fill="#64748b"/><circle cx="356" cy="162" r="3" fill="#64748b"/>
  <circle cx="344" cy="162" r="3" fill="#64748b"/><circle cx="337" cy="152" r="3" fill="#64748b"/>
  <circle cx="338" cy="138" r="3" fill="#64748b"/>
</svg>`;

const CARGO_VAN_SVG = `<svg viewBox="0 0 500 175" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <line x1="20" y1="168" x2="480" y2="168" stroke="#e2e8f0" stroke-width="1.5"/>
  <rect x="42" y="52" width="310" height="90" rx="3" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>
  <line x1="42" y1="90" x2="352" y2="90" stroke="#dde3ec" stroke-width="1.5"/>
  <line x1="48" y1="52" x2="48" y2="142" stroke="#475569" stroke-width="1.5"/>
  <line x1="42" y1="97" x2="100" y2="97" stroke="#c8d3de" stroke-width="1"/>
  <rect x="42" y="64" width="6" height="8" rx="1" fill="#94a3b8"/>
  <rect x="42" y="114" width="6" height="8" rx="1" fill="#94a3b8"/>
  <rect x="86" y="94" width="12" height="4" rx="2" fill="#94a3b8"/>
  <rect x="40" y="58" width="6" height="18" rx="1" fill="#fca5a5" stroke="#dc2626" stroke-width="1.5"/>
  <rect x="40" y="78" width="6" height="12" rx="1" fill="#fdba74" stroke="#ea580c" stroke-width="1.5"/>
  <rect x="32" y="116" width="12" height="26" rx="2" fill="#c8d3de" stroke="#475569" stroke-width="1.8"/>
  <rect x="170" y="88" width="100" height="54" rx="2" fill="#e8edf4" stroke="#6b7f94" stroke-width="1.5" stroke-dasharray="6 2"/>
  <rect x="200" y="110" width="38" height="5" rx="2.5" fill="#94a3b8" stroke="#64748b" stroke-width="1"/>
  <line x1="219" y1="107" x2="219" y2="118" stroke="#94a3b8" stroke-width="1"/>
  <rect x="178" y="58" width="84" height="27" rx="3" fill="#c8e1f8" stroke="#85b8e8" stroke-width="1.2" opacity="0.9"/>
  <rect x="352" y="70" width="100" height="72" rx="3" fill="#ecf0f7" stroke="#475569" stroke-width="2"/>
  <path d="M 355 70 L 365 50 L 442 50 L 452 70" fill="#dde3ec" stroke="#475569" stroke-width="2"/>
  <path d="M 366 68 L 374 52 L 440 52 L 448 68" fill="#c8e1f8" stroke="#85b8e8" stroke-width="1.2" opacity="0.9"/>
  <rect x="358" y="72" width="50" height="28" rx="3" fill="#c8e1f8" stroke="#85b8e8" stroke-width="1.2" opacity="0.9"/>
  <path d="M 450 65 L 466 60 L 467 71 L 450 73 Z" fill="#dde3ec" stroke="#475569" stroke-width="1.5"/>
  <rect x="408" y="50" width="6" height="90" rx="1" fill="#c8d3de" stroke="#475569" stroke-width="1"/>
  <rect x="449" y="95" width="16" height="35" rx="3" fill="#c8d3de" stroke="#475569" stroke-width="2"/>
  <line x1="449" y1="104" x2="465" y2="104" stroke="#8899aa" stroke-width="1"/>
  <line x1="449" y1="113" x2="465" y2="113" stroke="#8899aa" stroke-width="1"/>
  <line x1="449" y1="122" x2="465" y2="122" stroke="#8899aa" stroke-width="1"/>
  <rect x="449" y="82" width="14" height="11" rx="2" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
  <rect x="428" y="112" width="14" height="4" rx="2" fill="#94a3b8"/>
  <path d="M 66 140 Q 64 110 104 108 Q 144 106 144 140" fill="none" stroke="#475569" stroke-width="2"/>
  <path d="M 362 140 Q 360 110 400 108 Q 440 106 440 140" fill="none" stroke="#475569" stroke-width="2"/>
  <line x1="36" y1="140" x2="68" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="142" y1="140" x2="364" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <line x1="438" y1="140" x2="466" y2="140" stroke="#94a3b8" stroke-width="2.5"/>
  <circle cx="104" cy="150" r="28" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <circle cx="104" cy="150" r="20" fill="#1e293b"/><circle cx="104" cy="150" r="12" fill="#475569"/>
  <circle cx="104" cy="136" r="3" fill="#64748b"/><circle cx="116" cy="140" r="3" fill="#64748b"/>
  <circle cx="117" cy="154" r="3" fill="#64748b"/><circle cx="110" cy="164" r="3" fill="#64748b"/>
  <circle cx="98" cy="164" r="3" fill="#64748b"/><circle cx="91" cy="154" r="3" fill="#64748b"/>
  <circle cx="92" cy="140" r="3" fill="#64748b"/>
  <circle cx="400" cy="150" r="28" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <circle cx="400" cy="150" r="20" fill="#1e293b"/><circle cx="400" cy="150" r="12" fill="#475569"/>
  <circle cx="400" cy="136" r="3" fill="#64748b"/><circle cx="412" cy="140" r="3" fill="#64748b"/>
  <circle cx="413" cy="154" r="3" fill="#64748b"/><circle cx="406" cy="164" r="3" fill="#64748b"/>
  <circle cx="394" cy="164" r="3" fill="#64748b"/><circle cx="387" cy="154" r="3" fill="#64748b"/>
  <circle cx="388" cy="140" r="3" fill="#64748b"/>
</svg>`;

const BUILT_IN_TEMPLATES = [
  {
    id: 'tpl-pickup-truck',
    name: 'רכב טנדר',
    description: 'תבנית רכב טנדר לסימון נזקים, ציוד ומיקומים על הרכב',
    svgContent: PICKUP_TRUCK_SVG,
    pointsConfig: [
      { id: 'pt-truck-front',   label: 'חזית / פגוש קדמי', x: 89, y: 55, fieldType: 'text' },
      { id: 'pt-truck-hood',    label: 'מכסה מנוע',         x: 76, y: 42, fieldType: 'text' },
      { id: 'pt-truck-cabin',   label: 'תא נהג / דלתות',   x: 56, y: 50, fieldType: 'text' },
      { id: 'pt-truck-cargo',   label: 'ארגז משא',          x: 27, y: 50, fieldType: 'text' },
      { id: 'pt-truck-rear',    label: 'גב הרכב / פגוש',   x: 9,  y: 56, fieldType: 'text' },
      { id: 'pt-truck-mirror',  label: 'מראה / קצה קדמי',  x: 81, y: 42, fieldType: 'text' },
      { id: 'pt-truck-wheel-f', label: 'גלגל קדמי',         x: 71, y: 84, fieldType: 'text' },
      { id: 'pt-truck-wheel-r', label: 'גלגל אחורי',        x: 23, y: 84, fieldType: 'text' },
    ],
  },
  {
    id: 'tpl-person-employee',
    name: 'דמות עובד',
    description: 'תבנית גוף אדם לסימון פציעות, ממצאים רפואיים וציוד מגן',
    svgContent: PERSON_BODY_SVG,
    pointsConfig: [
      { id: 'pt-person-head',      label: 'ראש / צוואר',  x: 50, y: 11, fieldType: 'text' },
      { id: 'pt-person-r-shoulder',label: 'כתף ימין',     x: 22, y: 30, fieldType: 'text' },
      { id: 'pt-person-l-shoulder',label: 'כתף שמאל',     x: 78, y: 30, fieldType: 'text' },
      { id: 'pt-person-chest',     label: 'חזה / גוף עליון', x: 50, y: 38, fieldType: 'text' },
      { id: 'pt-person-r-arm',     label: 'יד ימין',      x: 7,  y: 55, fieldType: 'text' },
      { id: 'pt-person-l-arm',     label: 'יד שמאל',      x: 93, y: 55, fieldType: 'text' },
      { id: 'pt-person-abdomen',   label: 'בטן / גב',     x: 50, y: 60, fieldType: 'text' },
      { id: 'pt-person-r-leg',     label: 'רגל ימין',     x: 35, y: 80, fieldType: 'text' },
      { id: 'pt-person-l-leg',     label: 'רגל שמאל',     x: 65, y: 80, fieldType: 'text' },
    ],
  },
  {
    id: 'tpl-sedan-car',
    name: 'רכב פרטי',
    description: 'תבנית רכב פרטי (סדאן) לבדיקת נזקים, ביטוח וטסט',
    svgContent: SEDAN_CAR_SVG,
    pointsConfig: [
      { id: 'pt-car-front',      label: 'חזית / פגוש קדמי', x: 90, y: 60, fieldType: 'text' },
      { id: 'pt-car-hood',       label: 'מכסה מנוע',         x: 80, y: 48, fieldType: 'text' },
      { id: 'pt-car-windshield', label: 'שמשה קדמית',        x: 68, y: 38, fieldType: 'text' },
      { id: 'pt-car-roof',       label: 'גג הרכב',           x: 50, y: 28, fieldType: 'text' },
      { id: 'pt-car-rear-glass', label: 'שמשה אחורית',       x: 32, y: 38, fieldType: 'text' },
      { id: 'pt-car-trunk',      label: 'תא מטען / גב',      x: 20, y: 52, fieldType: 'text' },
      { id: 'pt-car-rear',       label: 'פגוש אחורי',        x: 10, y: 62, fieldType: 'text' },
      { id: 'pt-car-wheel-f',    label: 'גלגל קדמי',         x: 73, y: 90, fieldType: 'text' },
      { id: 'pt-car-wheel-r',    label: 'גלגל אחורי',        x: 23, y: 90, fieldType: 'text' },
    ],
  },
  {
    id: 'tpl-cargo-van',
    name: 'רכב מסחרי / ואן',
    description: 'תבנית ואן מסחרי לבדיקת מצב, העמסה ונזקים',
    svgContent: CARGO_VAN_SVG,
    pointsConfig: [
      { id: 'pt-van-front',      label: 'חזית / קבינה',   x: 90, y: 60, fieldType: 'text' },
      { id: 'pt-van-windshield', label: 'שמשה קדמית',     x: 82, y: 38, fieldType: 'text' },
      { id: 'pt-van-roof',       label: 'גג',              x: 50, y: 32, fieldType: 'text' },
      { id: 'pt-van-side-door',  label: 'דלת צד הזזה',    x: 46, y: 72, fieldType: 'text' },
      { id: 'pt-van-cargo',      label: 'תא מטען',         x: 22, y: 52, fieldType: 'text' },
      { id: 'pt-van-rear-door',  label: 'דלתות אחוריות',  x: 10, y: 56, fieldType: 'text' },
      { id: 'pt-van-wheel-f',    label: 'גלגל קדמי',       x: 80, y: 88, fieldType: 'text' },
      { id: 'pt-van-wheel-r',    label: 'גלגל אחורי',      x: 21, y: 88, fieldType: 'text' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class SvgTemplateService implements OnModuleInit {
  private readonly logger = new Logger(SvgTemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Runs once on startup — ensures built-in templates always exist in DB */
  async onModuleInit() {
    try {
      const adminUser = await this.prisma.user.findFirst({
        where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
        orderBy: { createdAt: 'asc' },
      });
      if (!adminUser) {
        this.logger.warn('No admin user found — skipping built-in template seed');
        return;
      }
      for (const tpl of BUILT_IN_TEMPLATES) {
        await this.prisma.svgTemplate.upsert({
          where: { id: tpl.id },
          update: {
            svgContent: tpl.svgContent,
            pointsConfig: tpl.pointsConfig as object[],
          },
          create: {
            id: tpl.id,
            name: tpl.name,
            description: tpl.description,
            svgContent: tpl.svgContent,
            pointsConfig: tpl.pointsConfig as object[],
            isActive: true,
            isBuiltIn: true,
            createdById: adminUser.id,
          },
        });
      }
      this.logger.log(`Built-in SVG templates seeded (${BUILT_IN_TEMPLATES.length})`);
    } catch (err) {
      this.logger.error('Failed to seed built-in SVG templates', err);
    }
  }

  async create(dto: CreateSvgTemplateDto, userId: string) {
    return this.prisma.svgTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        svgContent: dto.svgContent,
        thumbnail: dto.thumbnail,
        pointsConfig: (dto.pointsConfig as object[]) ?? [],
        isActive: dto.isActive ?? true,
        createdById: userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  }

  async findAll(page = 1, limit = 20, activeOnly = false) {
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);
    const where = activeOnly ? { isActive: true } : {};
    const [templates, total] = await Promise.all([
      this.prisma.svgTemplate.findMany({
        where,
        skip,
        take,
        orderBy: [{ isBuiltIn: 'desc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          name: true,
          description: true,
          thumbnail: true,
          isActive: true,
          isBuiltIn: true,
          createdAt: true,
          createdBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.svgTemplate.count({ where }),
    ]);
    return { templates, total, page, limit: take };
  }

  async findOne(id: string) {
    const template = await this.prisma.svgTemplate.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    if (!template) throw new NotFoundException(`SvgTemplate ${id} not found`);
    return template;
  }

  async update(id: string, dto: UpdateSvgTemplateDto) {
    await this.findOne(id);
    return this.prisma.svgTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.svgContent !== undefined && { svgContent: dto.svgContent }),
        ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail }),
        ...(dto.pointsConfig !== undefined && { pointsConfig: dto.pointsConfig as object[] }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.svgTemplate.delete({ where: { id } });
  }

  async clone(id: string, userId: string) {
    const original = await this.findOne(id);
    return this.prisma.svgTemplate.create({
      data: {
        name: `${original.name} (עותק)`,
        description: original.description,
        svgContent: original.svgContent,
        thumbnail: original.thumbnail,
        pointsConfig: original.pointsConfig as object[],
        isActive: true,
        isBuiltIn: false,
        createdById: userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  }

  async attachToProcess(templateId: string, processId: string) {
    return this.prisma.processSvgAttachment.upsert({
      where: { processId_templateId: { processId, templateId } },
      update: {},
      create: { processId, templateId },
      include: { template: { select: { id: true, name: true, thumbnail: true, description: true } } },
    });
  }

  async detachFromProcess(templateId: string, processId: string) {
    return this.prisma.processSvgAttachment.deleteMany({
      where: { processId, templateId },
    });
  }

  async getProcessAttachments(processId: string) {
    return this.prisma.processSvgAttachment.findMany({
      where: { processId },
      include: {
        template: {
          select: { id: true, name: true, description: true, thumbnail: true, pointsConfig: true, svgContent: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
