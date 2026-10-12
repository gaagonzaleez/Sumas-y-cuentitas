# Genera los SVG base del avatar en content/avatar/svg/ (se corrió una vez; los SVG se pueden
# editar a mano o sumar nuevos sin tocar este script). Lienzo 0 0 200 260, ver docs/guia-de-estilo.md.
import os
T = '#2B2350'
S = f'stroke="{T}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"'
def svg(body): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">{body}</svg>\n'
def pies(fill, extra=''):
    return (f'<path d="M70 252 Q70 239 84 239 L98 239 L98 256 L74 256 Q70 256 70 252 Z" fill="{fill}" {S}/>'
            f'<path d="M130 252 Q130 239 116 239 L102 239 L102 256 L126 256 Q130 256 130 252 Z" fill="{fill}" {S}/>' + extra)
TORSO = 'M66 170 Q66 154 86 152 L114 152 Q134 154 134 170 L142 188 L128 194 L130 216 Q100 224 70 216 L72 194 L58 188 Z'
CUELLO = f'<path d="M88 152 Q100 166 112 152" fill="var(--piel)" {S}/>'
A = {}
# ---------- Ropa de arriba ----------
A['remera'] = f'<path d="{TORSO}" fill="var(--tela)" {S}/>' + CUELLO
A['remera-rayada'] = A['remera'] + f'<g stroke="var(--tela2)" stroke-width="6"><path d="M72 176 L128 176"/><path d="M71 192 L129 192"/><path d="M71 207 L129 207"/></g><path d="{TORSO}" fill="none" {S}/>' + CUELLO
A['remera-estrella'] = A['remera'] + f'<path d="M100 172 L105 184 L118 184 L108 192 L112 205 L100 197 L88 205 L92 192 L82 184 L95 184 Z" fill="var(--tela2)" stroke="{T}" stroke-width="2.5" stroke-linejoin="round"/>'
A['remera-corazon'] = A['remera'] + f'<path d="M100 204 Q80 190 86 179 Q92 170 100 180 Q108 170 114 179 Q120 190 100 204 Z" fill="var(--tela2)" stroke="{T}" stroke-width="2.5"/>'
A['musculosa'] = f'<path d="M80 152 L90 152 Q100 166 110 152 L120 152 Q130 170 130 216 Q100 224 70 216 Q70 170 80 152 Z" fill="var(--tela)" {S}/>'
BUZO = 'M66 170 Q66 154 86 152 L114 152 Q134 154 134 170 L148 206 L134 212 L130 194 L130 216 Q100 224 70 216 L70 194 L66 212 L52 206 Z'
A['buzo'] = f'<path d="{BUZO}" fill="var(--tela)" {S}/><path d="M76 208 L124 208" stroke="var(--tela2)" stroke-width="6"/><path d="{BUZO}" fill="none" {S}/>' + CUELLO
A['campera'] = f'<path d="{BUZO}" fill="var(--tela)" {S}/><path d="M100 160 L100 218" {S}/><path d="M86 152 L100 170 L114 152" fill="var(--tela2)" {S}/><circle cx="92" cy="186" r="3" fill="{T}"/><circle cx="108" cy="186" r="3" fill="{T}"/>'
A['blusa-volados'] = f'<path d="{TORSO}" fill="var(--tela)" {S}/><path d="M70 212 Q76 222 82 212 Q88 222 94 212 Q100 222 106 212 Q112 222 118 212 Q124 222 130 212" fill="var(--tela2)" {S}/><path d="M58 188 Q62 196 66 190 Q70 198 72 192" fill="none" {S}/><path d="M142 188 Q138 196 134 190 Q130 198 128 192" fill="none" {S}/>' + CUELLO
# ---------- Ropa de abajo ----------
A['pantalon'] = f'<path d="M72 206 L128 206 L127 248 L104 248 L100 224 L96 248 L73 248 Z" fill="var(--tela)" {S}/>'
A['short'] = f'<path d="M72 206 L128 206 L129 230 L104 230 L100 220 L96 230 L71 230 Z" fill="var(--tela)" {S}/>'
A['pollera'] = f'<path d="M72 204 L128 204 L142 238 Q100 246 58 238 Z" fill="var(--tela)" {S}/>'
A['pollera-tul'] = f'<path d="M72 204 L128 204 L144 236 Q138 244 132 238 Q126 246 118 240 Q110 248 100 241 Q90 248 82 240 Q74 246 68 238 Q62 244 56 236 Z" fill="var(--tela)" {S}/><g fill="#fff" opacity=".7"><circle cx="86" cy="222" r="2.5"/><circle cx="104" cy="230" r="2.5"/><circle cx="120" cy="220" r="2.5"/></g>'
A['calza'] = f'<path d="M73 206 L127 206 L125 248 L105 248 L100 222 L95 248 L75 248 Z" fill="var(--tela)" {S}/><path d="M80 236 L92 236 M108 236 L120 236" stroke="var(--tela2)" stroke-width="4"/>'
A['jardinero'] = f'<path d="M72 206 L128 206 L127 248 L104 248 L100 224 L96 248 L73 248 Z" fill="var(--tela)" {S}/><path d="M80 176 L120 176 L122 208 L78 208 Z" fill="var(--tela)" {S}/><path d="M80 178 L76 156 M120 178 L124 156" {S}/><circle cx="84" cy="182" r="3" fill="var(--tela2)"/><circle cx="116" cy="182" r="3" fill="var(--tela2)"/><rect x="92" y="186" width="16" height="12" rx="3" fill="var(--tela2)" stroke="{T}" stroke-width="2.5"/>'
# ---------- Vestidos y disfraces (reemplazan arriba y abajo) ----------
VEST = 'M84 152 L116 152 Q132 156 132 172 L128 196 L148 240 Q100 250 52 240 L72 196 L68 172 Q68 156 84 152 Z'
A['vestido'] = f'<path d="{VEST}" fill="var(--tela)" {S}/><path d="M72 198 Q100 206 128 198" fill="none" stroke="var(--tela2)" stroke-width="6"/>' + CUELLO
A['vestido-volados'] = f'<path d="{VEST}" fill="var(--tela)" {S}/><path d="M54 236 Q60 248 68 240 Q76 250 84 242 Q92 252 100 243 Q108 252 116 242 Q124 250 132 240 Q140 248 146 236" fill="var(--tela2)" {S}/><path d="M72 198 Q100 206 128 198" fill="none" stroke="var(--tela2)" stroke-width="6"/>' + CUELLO
A['vestido-estrellas'] = f'<path d="{VEST}" fill="var(--tela)" {S}/><g fill="var(--tela2)"><path d="M84 216 l3 7 7 0 -6 4 2 7 -6-4 -6 4 2-7 -6-4 7 0z"/><path d="M112 206 l3 7 7 0 -6 4 2 7 -6-4 -6 4 2-7 -6-4 7 0z"/><path d="M100 176 l2.5 6 6 0 -5 3.5 2 6 -5.5-3.5 -5.5 3.5 2-6 -5-3.5 6 0z"/></g>' + CUELLO
A['mameluco'] = f'<path d="M66 170 Q66 154 86 152 L114 152 Q134 154 134 170 L142 188 L128 194 L128 248 L104 248 L100 224 L96 248 L72 248 L72 194 L58 188 Z" fill="var(--tela)" {S}/><path d="M72 206 L128 206" stroke="var(--tela2)" stroke-width="6"/>' + CUELLO
A['tunica'] = f'<path d="M84 152 L116 152 Q134 156 136 176 L140 230 Q100 240 60 230 L64 176 Q66 156 84 152 Z" fill="var(--tela)" {S}/><path d="M66 206 L134 206" stroke="var(--tela2)" stroke-width="7"/><circle cx="100" cy="206" r="6" fill="#FFC93C" stroke="{T}" stroke-width="2.5"/>' + CUELLO
# ---------- Calzado ----------
A['zapatillas'] = pies('var(--tela)', f'<path d="M72 251 L97 251 M103 251 L128 251" stroke="#fff" stroke-width="3"/>')
A['zapatitos'] = pies('var(--tela)', f'<circle cx="88" cy="244" r="3" fill="var(--tela2)"/><circle cx="112" cy="244" r="3" fill="var(--tela2)"/>')
A['botas'] = (f'<path d="M76 224 L98 224 L98 256 L74 256 Q68 256 70 248 Q76 244 76 236 Z" fill="var(--tela)" {S}/>'
              f'<path d="M124 224 L102 224 L102 256 L126 256 Q132 256 130 248 Q124 244 124 236 Z" fill="var(--tela)" {S}/>'
              f'<path d="M76 230 L98 230 M102 230 L124 230" stroke="var(--tela2)" stroke-width="4"/>')
A['sandalias'] = (f'<path d="M70 254 L98 254" {S}/><path d="M130 254 L102 254" {S}/>'
                  f'<path d="M78 254 Q86 238 96 252 M122 254 Q114 238 104 252" fill="none" stroke="var(--tela)" stroke-width="5"/>')
# ---------- Accesorios ----------
A['mono'] = f'<path d="M138 46 L120 36 L122 60 Z M138 46 L156 36 L154 60 Z" fill="var(--tela)" {S}/><circle cx="138" cy="48" r="7" fill="var(--tela2)" {S}/>'
A['vincha'] = f'<path d="M46 80 Q50 34 100 32 Q150 34 154 80" fill="none" stroke="{T}" stroke-width="12"/><path d="M46 80 Q50 34 100 32 Q150 34 154 80" fill="none" stroke="var(--tela)" stroke-width="6"/>'
A['vincha-orejitas'] = A['vincha'] + f'<path d="M60 52 L58 24 L80 40 Z M140 52 L142 24 L120 40 Z" fill="var(--tela)" {S}/><path d="M63 44 L62 32 L72 40 Z M137 44 L138 32 L128 40 Z" fill="var(--tela2)"/>'
A['gorro'] = f'<path d="M42 78 Q44 22 100 20 Q156 22 158 78 Z" fill="var(--tela)" {S}/><rect x="38" y="70" width="124" height="16" rx="8" fill="var(--tela2)" {S}/><circle cx="100" cy="18" r="10" fill="var(--tela2)" {S}/>'
A['gorra'] = f'<path d="M46 72 Q48 26 100 24 Q150 26 154 72 Z" fill="var(--tela)" {S}/><path d="M120 70 Q160 64 182 76 Q170 84 120 78 Z" fill="var(--tela2)" {S}/>'
A['corona'] = f'<path d="M64 52 L66 20 L84 38 L100 14 L116 38 L134 20 L136 52 Z" fill="var(--tela)" {S}/><circle cx="100" cy="36" r="5" fill="var(--tela2)" {S}/><circle cx="76" cy="44" r="3.5" fill="var(--tela2)"/><circle cx="124" cy="44" r="3.5" fill="var(--tela2)"/>'
A['tiara'] = f'<path d="M58 60 Q100 28 142 60" fill="none" stroke="{T}" stroke-width="9"/><path d="M58 60 Q100 28 142 60" fill="none" stroke="var(--tela)" stroke-width="4"/><path d="M100 22 L106 38 L100 50 L94 38 Z" fill="var(--tela2)" {S}/>'
A['sombrero'] = f'<ellipse cx="100" cy="58" rx="84" ry="16" fill="var(--tela)" {S}/><path d="M60 58 Q62 14 100 14 Q138 14 140 58 Z" fill="var(--tela)" {S}/><path d="M61 46 Q100 54 139 46" fill="none" stroke="var(--tela2)" stroke-width="8"/>'
A['flor-pelo'] = ''.join(f'<circle cx="{142+dx}" cy="{56+dy}" r="8" fill="var(--tela)" {S}/>' for dx,dy in [(0,-9),(9,-2),(5,8),(-6,8),(-9,-2)]) + f'<circle cx="142" cy="57" r="6" fill="var(--tela2)" {S}/>'
A['estrella-pelo'] = f'<path d="M58 40 L63 52 L76 52 L66 60 L70 72 L58 65 L46 72 L50 60 L40 52 L53 52 Z" fill="var(--tela)" {S}/>'
A['auriculares'] = f'<path d="M40 104 Q38 28 100 26 Q162 28 160 104" fill="none" stroke="{T}" stroke-width="10"/><path d="M40 104 Q38 28 100 26 Q162 28 160 104" fill="none" stroke="var(--tela2)" stroke-width="4"/><rect x="28" y="90" width="22" height="32" rx="10" fill="var(--tela)" {S}/><rect x="150" y="90" width="22" height="32" rx="10" fill="var(--tela)" {S}/>'
A['anteojos'] = f'<g fill="rgba(255,255,255,.25)" stroke="var(--tela)" stroke-width="5"><circle cx="78" cy="104" r="15"/><circle cx="122" cy="104" r="15"/></g><path d="M93 102 Q100 96 107 102" fill="none" stroke="var(--tela)" stroke-width="4"/><g fill="none" stroke="{T}" stroke-width="1.5"><circle cx="78" cy="104" r="18"/><circle cx="122" cy="104" r="18"/></g>'
A['anteojos-sol'] = f'<path d="M60 96 L96 96 Q96 118 78 118 Q60 118 60 96 Z M104 96 L140 96 Q140 118 122 118 Q104 118 104 96 Z" fill="var(--tela)" {S}/><path d="M96 98 L104 98" {S}/><path d="M66 102 L72 100" stroke="#fff" stroke-width="3"/>'
A['collar'] = f'<path d="M84 154 Q100 176 116 154" fill="none" stroke="var(--tela)" stroke-width="3"/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="4.5" fill="var(--tela2)" stroke="{T}" stroke-width="2"/>' for x,y in [(88,162),(94,168),(100,171),(106,168),(112,162)])
A['collar-corazon'] = f'<path d="M84 154 Q100 176 116 154" fill="none" stroke="var(--tela)" stroke-width="3"/><path d="M100 184 Q88 176 92 170 Q96 165 100 171 Q104 165 108 170 Q112 176 100 184 Z" fill="var(--tela2)" stroke="{T}" stroke-width="2.5"/>'
A['bufanda'] = f'<path d="M78 150 Q100 168 122 150 L124 164 Q100 180 76 164 Z" fill="var(--tela)" {S}/><path d="M110 166 L116 200 L128 196 L120 162" fill="var(--tela)" {S}/><path d="M86 160 L88 168 M100 165 L100 173 M114 160 L112 168" stroke="var(--tela2)" stroke-width="4"/>'
A['varita'] = f'<path d="M144 220 L170 170" stroke="{T}" stroke-width="7"/><path d="M144 220 L170 170" stroke="var(--tela2)" stroke-width="3"/><path d="M172 154 L176 164 L187 164 L178 171 L182 182 L172 175 L162 182 L166 171 L157 164 L168 164 Z" fill="var(--tela)" {S}/>'
A['globo'] = f'<path d="M142 214 Q150 150 160 104" fill="none" stroke="{T}" stroke-width="2"/><ellipse cx="162" cy="82" rx="20" ry="24" fill="var(--tela)" {S}/><path d="M156 106 L162 112 L168 106 Z" fill="var(--tela)" {S}/><path d="M152 72 Q154 66 160 64" stroke="#fff" stroke-width="3" fill="none"/>'
A['ramo'] = f'<path d="M136 220 L146 190 L158 220 Z" fill="var(--tela2)" {S}/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="8" fill="var(--tela)" {S}/>' for x,y in [(138,186),(150,178),(160,190),(146,194)])
# Espalda (se dibujan detrás del cuerpo)
A['alas'] = f'<path d="M84 170 Q40 120 18 150 Q10 190 60 200 Q30 210 44 230 Q66 236 86 196 Z M116 170 Q160 120 182 150 Q190 190 140 200 Q170 210 156 230 Q134 236 114 196 Z" fill="var(--tela)" {S} opacity=".95"/><path d="M36 160 Q50 168 64 180 M164 160 Q150 168 136 180" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>'
A['capa'] = f'<path d="M78 156 Q40 210 46 250 L154 250 Q160 210 122 156 Z" fill="var(--tela)" {S}/>'
A['mochila'] = f'<rect x="58" y="162" width="84" height="64" rx="18" fill="var(--tela)" {S}/>'
A['mochila-tiras'] = f'<path d="M78 156 L76 210 M122 156 L124 210" stroke="{T}" stroke-width="9"/><path d="M78 156 L76 210 M122 156 L124 210" stroke="var(--tela2)" stroke-width="5"/>'
# ---------- Detalles de la cara ----------
A['pecas'] = ''.join(f'<circle cx="{x}" cy="{y}" r="1.8" fill="#8A5638" opacity=".7"/>' for x,y in [(66,116),(72,120),(64,123),(134,116),(128,120),(136,123)])
A['brillos'] = f'<g fill="#FFC93C" stroke="{T}" stroke-width="1.5"><path d="M60 128 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2z"/><path d="M140 128 l2 5 5 2 -5 2 -2 5 -2-5 -5-2 5-2z"/></g>'
A['curita'] = f'<rect x="124" y="114" width="20" height="9" rx="4" transform="rotate(-20 134 118)" fill="#FFD9B0" {S}/>'
# ---------- Pelo (adelante y atrás) ----------
FLEQ = 'M44 100 Q42 40 100 38 Q158 40 156 100 Q148 72 126 62 Q118 76 92 76 Q62 76 52 70 Q46 84 44 100 Z'
A['pelo-largo'] = f'<path d="{FLEQ}" fill="var(--pelo)" {S}/>'
A['pelo-largo.atras'] = f'<path d="M42 100 Q36 36 100 32 Q164 36 158 100 L166 196 Q100 210 34 196 Z" fill="var(--pelo)" {S}/>'
A['pelo-corto'] = A['pelo-largo']
A['pelo-corto.atras'] = f'<path d="M40 104 Q36 36 100 32 Q164 36 160 104 L164 146 Q150 154 140 144 L60 144 Q50 154 36 146 Z" fill="var(--pelo)" {S}/>'
A['pelo-carre'] = f'<path d="M44 104 Q42 40 100 38 Q158 40 156 104 L156 84 L44 84 Z" fill="var(--pelo)" {S}/>'
A['pelo-carre.atras'] = f'<path d="M38 112 Q34 34 100 32 Q166 34 162 112 L164 150 L36 150 Z" fill="var(--pelo)" {S}/>'
rul_adel = ''.join(f'<circle cx="{x}" cy="{y}" r="13" fill="var(--pelo)" {S}/>' for x,y in [(52,82),(64,62),(82,52),(100,48),(118,52),(136,62),(148,82)])
A['pelo-rulos'] = rul_adel
A['pelo-rulos.atras'] = ''.join(f'<circle cx="{x}" cy="{y}" r="22" fill="var(--pelo)" {S}/>' for x,y in [(44,90),(40,126),(48,160),(156,90),(160,126),(152,160),(60,52),(100,36),(140,52)]) + '<ellipse cx="100" cy="110" rx="62" ry="62" fill="var(--pelo)"/>'
A['pelo-afro'] = f'<path d="M48 84 Q60 54 100 52 Q140 54 152 84 Q130 70 100 70 Q70 70 48 84 Z" fill="var(--pelo)" {S}/>'
A['pelo-afro.atras'] = f'<circle cx="100" cy="88" r="80" fill="var(--pelo)" {S}/>'
A['pelo-colitas'] = A['pelo-largo'] + f'<ellipse cx="30" cy="118" rx="16" ry="30" fill="var(--pelo)" {S}/><ellipse cx="170" cy="118" rx="16" ry="30" fill="var(--pelo)" {S}/><circle cx="40" cy="88" r="7" fill="var(--tela2,#E8505B)" {S}/><circle cx="160" cy="88" r="7" fill="var(--tela2,#E8505B)" {S}/>'
A['pelo-colitas.atras'] = f'<path d="M42 104 Q38 36 100 32 Q162 36 158 104 L158 124 L42 124 Z" fill="var(--pelo)" {S}/>'
braid = lambda x: ''.join(f'<ellipse cx="{x}" cy="{y}" rx="11" ry="9" fill="var(--pelo)" {S}/>' for y in range(118, 200, 14))
A['pelo-trenzas'] = A['pelo-largo'] + braid(40) + braid(160)
A['pelo-trenzas.atras'] = A['pelo-colitas.atras']
A['pelo-rodete'] = f'<path d="M44 100 Q44 44 100 42 Q156 44 156 100 Q150 64 100 60 Q50 64 44 100 Z" fill="var(--pelo)" {S}/>'
A['pelo-rodete.atras'] = f'<circle cx="100" cy="30" r="22" fill="var(--pelo)" {S}/><path d="M42 104 Q38 40 100 36 Q162 40 158 104 Z" fill="var(--pelo)" {S}/>'
A['pelo-chonguitos'] = A['pelo-rodete']
A['pelo-chonguitos.atras'] = f'<circle cx="54" cy="42" r="20" fill="var(--pelo)" {S}/><circle cx="146" cy="42" r="20" fill="var(--pelo)" {S}/><path d="M42 104 Q38 40 100 36 Q162 40 158 104 Z" fill="var(--pelo)" {S}/>'
A['pelo-ondas'] = A['pelo-largo']
A['pelo-ondas.atras'] = f'<path d="M42 100 Q36 36 100 32 Q164 36 158 100 Q172 126 158 150 Q172 174 160 198 Q100 212 40 198 Q28 174 42 150 Q28 126 42 100 Z" fill="var(--pelo)" {S}/>'
A['pelo-media-cola'] = A['pelo-largo']
A['pelo-media-cola.atras'] = f'<path d="M42 100 Q36 36 100 32 Q164 36 158 100 L160 170 Q100 182 40 170 Z" fill="var(--pelo)" {S}/><ellipse cx="160" cy="44" rx="14" ry="22" transform="rotate(30 160 44)" fill="var(--pelo)" {S}/>'
A['pelo-flequillo'] = f'<path d="M44 104 Q42 40 100 38 Q158 40 156 104 L156 80 Q100 88 44 80 Z" fill="var(--pelo)" {S}/>'
A['pelo-flequillo.atras'] = A['pelo-largo.atras']
A['pelo-cola-alta'] = A['pelo-rodete']
A['pelo-cola-alta.atras'] = f'<path d="M100 30 Q150 20 160 70 Q170 120 150 150 Q156 100 130 56 Z" fill="var(--pelo)" {S}/><path d="M42 104 Q38 40 100 36 Q162 40 158 104 Z" fill="var(--pelo)" {S}/><circle cx="104" cy="32" r="8" fill="var(--tela2,#5B3FE0)" {S}/>'
A['pelo-rapado'] = f'<path d="M46 92 Q46 42 100 40 Q154 42 154 92 Q140 60 100 58 Q60 60 46 92 Z" fill="var(--pelo)" {S}/>'
# ---------- Fondos (rectángulo completo) ----------
def fondo(c1, c2, extra=''): return f'<rect width="200" height="260" fill="{c1}"/><path d="M0 200 Q100 176 200 200 L200 260 L0 260 Z" fill="{c2}"/>' + extra
A['fondo-lila'] = fondo('#E9E3FF', '#D9D0FF')
A['fondo-cielo'] = fondo('#CDE9FF', '#B7E8A0', '<g fill="#fff"><ellipse cx="40" cy="40" rx="22" ry="10"/><ellipse cx="160" cy="60" rx="26" ry="11"/></g>')
A['fondo-rosa'] = fondo('#FFE3E6', '#FFC8D0', '<g fill="#fff" opacity=".7"><circle cx="30" cy="30" r="6"/><circle cx="170" cy="40" r="5"/><circle cx="160" cy="150" r="4"/></g>')
A['fondo-jardin'] = fondo('#D7F5EE', '#9ED9A8', ''.join(f'<circle cx="{x}" cy="{y}" r="6" fill="{c}" stroke="#2B2350" stroke-width="2"/>' for x,y,c in [(20,220,'#FFC93C'),(50,236,'#E8505B'),(160,226,'#9A7BF0'),(186,240,'#FFC93C')]))
A['fondo-noche'] = fondo('#3F28B8', '#2B2350', '<g fill="#FFC93C"><circle cx="30" cy="30" r="3"/><circle cx="170" cy="24" r="2.5"/><circle cx="150" cy="80" r="2"/><circle cx="50" cy="90" r="2"/></g><circle cx="160" cy="44" r="16" fill="#FFF4D1"/>')
A['fondo-playa'] = f'<rect width="200" height="260" fill="#CDE9FF"/><path d="M0 170 Q50 160 100 170 Q150 180 200 170 L200 210 L0 210 Z" fill="#7CC6F2"/><path d="M0 200 Q100 190 200 200 L200 260 L0 260 Z" fill="#FFE6A8"/><circle cx="170" cy="36" r="18" fill="#FFC93C"/>'
A['fondo-arcoiris'] = '<rect width="200" height="260" fill="#F3EEFF"/>' + ''.join(f'<path d="M-10 230 A110 110 0 0 1 210 230" fill="none" stroke="{c}" stroke-width="12" transform="translate(0 {i*12})"/>' for i,c in enumerate(['#E8505B','#F29A2E','#FFC93C','#3DBE7A','#7CC6F2','#9A7BF0']))
A['fondo-castillo'] = fondo('#FFE3E6', '#D7F5EE', '<g fill="#E9E3FF" stroke="#2B2350" stroke-width="2"><rect x="10" y="120" width="40" height="90"/><rect x="150" y="120" width="40" height="90"/><path d="M8 120 L30 90 L52 120 Z M148 120 L170 90 L192 120 Z" fill="#9A7BF0"/></g>')
A['fondo-mar'] = f'<rect width="200" height="260" fill="#7CC6F2"/><g fill="#fff" opacity=".6"><circle cx="30" cy="200" r="6"/><circle cx="40" cy="170" r="4"/><circle cx="170" cy="120" r="5"/></g><path d="M0 230 Q50 220 100 230 Q150 240 200 230 L200 260 L0 260 Z" fill="#FFE6A8"/>'
A['fondo-dorado'] = fondo('#FFF4D1', '#FFE6A8', '<g fill="#E8B21F"><path d="M30 40 l3 7 7 0 -6 4 2 7 -6-4 -6 4 2-7 -6-4 7 0z"/><path d="M170 60 l3 7 7 0 -6 4 2 7 -6-4 -6 4 2-7 -6-4 7 0z"/></g>')
# ---------- Marcos (encima de todo) ----------
A['marco-estrellas'] = '<rect x="4" y="4" width="192" height="252" rx="20" fill="none" stroke="var(--tela)" stroke-width="8"/>' + ''.join(f'<path d="M{x} {y} l3 7 7 0 -6 4 2 7 -6-4 -6 4 2-7 -6-4 7 0z" fill="var(--tela2)" stroke="{T}" stroke-width="1.5"/>' for x,y in [(16,8),(180,8),(16,232),(180,232)])
A['marco-flores'] = '<rect x="4" y="4" width="192" height="252" rx="20" fill="none" stroke="var(--tela)" stroke-width="8"/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="9" fill="var(--tela2)" stroke="{T}" stroke-width="2"/>' for x,y in [(12,12),(188,12),(12,248),(188,248),(100,8)])
A['marco-corazones'] = '<rect x="4" y="4" width="192" height="252" rx="20" fill="none" stroke="var(--tela)" stroke-width="8"/>' + ''.join(f'<path d="M{x} {y+8} q-10 -7 -6 -12 q4 -4 6 1 q2 -5 6 -1 q4 5 -6 12z" fill="var(--tela2)" stroke="{T}" stroke-width="1.5"/>' for x,y in [(16,6),(184,6),(16,236),(184,236)])
os.makedirs('content/avatar/svg', exist_ok=True)
for k, v in A.items():
    open(f'content/avatar/svg/{k}.svg', 'w').write(svg(v))
print(len(A), 'SVG')
