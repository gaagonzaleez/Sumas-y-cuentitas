#!/usr/bin/env python3
"""Genera los audios de las guías con voces abiertas y gratuitas (Piper y Kokoro).

- Lee content/audio/manifiesto.json (lo arma `npm run audio:manifiesto`).
- Usa la configuración de scripts/voz/voces.json (se puede cambiar de voz sin tocar la app).
- Antes de usar una voz verifica su licencia (MODEL_CARD de Piper / licencia de Kokoro) y descarta
  las que no permiten uso comercial. Anota todo en docs/voces-licencias.json.
- Solo genera los audios que faltan (o todos si cambió la voz). Guarda mp3 en content/audio/<guia>/.
- También guarda muestras de cada voz candidata en docs/voces-muestras/ para compararlas.

Uso: python scripts/voz/generar.py [--solo-muestras] [--limite N]
"""
import argparse, hashlib, json, os, re, subprocess, sys, tempfile, urllib.request, wave
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
MODELOS = RAIZ / 'scripts' / 'voz' / '.modelos'
CFG = json.loads((RAIZ / 'scripts/voz/voces.json').read_text())
HF = 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/'
KOKORO = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
LICENCIAS = {}


def bajar(url: str, destino: Path) -> Path:
    if not destino.exists():
        destino.parent.mkdir(parents=True, exist_ok=True)
        print('  bajando', url, flush=True)
        urllib.request.urlretrieve(url, destino)
    return destino


def licencia_piper(modelo: str) -> str:
    carpeta = modelo.rsplit('/', 1)[0]
    card = bajar(HF + carpeta + '/MODEL_CARD', MODELOS / (modelo.replace('/', '_') + '.MODEL_CARD')).read_text(errors='ignore')
    m = re.search(r'[Ll]icen[sc]e[^:\n]*:?\s*\**\s*([^\n]+)', card)
    lic = (m.group(1) if m else 'desconocida').strip().strip('*').strip()
    LICENCIAS[modelo] = {'motor': 'piper', 'licencia': lic, 'tarjeta': card[:1500]}
    return lic


def permitida(lic: str) -> bool:
    l = lic.lower()
    if 'nc' in re.split(r'[^a-z]+', l) or 'non-commercial' in l or 'noncommercial' in l:
        return False
    return any(p in l for p in CFG['licenciasPermitidas'])


# ---------- Motores ----------
_cache = {}

def piper_wav(c: dict, texto: str, salida: Path):
    from piper import PiperVoice  # piper-tts
    modelo = c['modelo']
    if modelo not in _cache:
        onnx = bajar(HF + modelo + '.onnx', MODELOS / (Path(modelo).name + '.onnx'))
        bajar(HF + modelo + '.onnx.json', MODELOS / (Path(modelo).name + '.onnx.json'))
        _cache[modelo] = PiperVoice.load(str(onnx))
    voz = _cache[modelo]
    with wave.open(str(salida), 'wb') as w:
        try:
            from piper import SynthesisConfig  # piper-tts >= 1.3
            voz.synthesize_wav(texto, w, syn_config=SynthesisConfig(
                length_scale=c.get('velocidad', 1.0),
                noise_scale=c.get('variacion', 0.667),
                noise_w_scale=c.get('ritmo', 0.8),
            ))
        except ImportError:
            voz.synthesize(texto, w, length_scale=c.get('velocidad', 1.0), noise_scale=c.get('variacion', 0.667))


def kokoro_wav(c: dict, texto: str, salida: Path):
    import soundfile as sf
    from kokoro_onnx import Kokoro
    if 'kokoro' not in _cache:
        m = bajar(KOKORO + 'kokoro-v1.0.onnx', MODELOS / 'kokoro-v1.0.onnx')
        v = bajar(KOKORO + 'voices-v1.0.bin', MODELOS / 'voices-v1.0.bin')
        _cache['kokoro'] = Kokoro(str(m), str(v))
    # es-419: español latinoamericano (con seseo), no el de España.
    try:
        muestras, sr = _cache['kokoro'].create(texto, voice=c['voz'], speed=c.get('velocidad', 1.0), lang=c.get('idioma', 'es'))
    except Exception:
        muestras, sr = _cache['kokoro'].create(texto, voice=c['voz'], speed=c.get('velocidad', 1.0), lang='es')
    sf.write(str(salida), muestras, sr)


def a_mp3(wav: Path, mp3: Path, semitonos: float):
    f = CFG['mp3']['frecuencia']
    filtros = []
    if abs(semitonos) > 0.01:
        # Cambia el tono SIN cambiar el timbre (formantes preservados): antes se usaba
        # asetrate, que suena a "voz de ardilla" y muy robótica.
        k = 2 ** (semitonos / 12)
        filtros.append(f'rubberband=pitch={k:.5f}:formant=preserved:transients=smooth:window=standard')
    # Un poco más cálida y pareja: saca graves inútiles y empareja el volumen entre pedacitos.
    filtros += CFG['mp3'].get('filtros', [])
    # Recorta el silencio del principio y del final (sin tocar las pausas del medio).
    recorte = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03'
    filtros += [recorte, 'areverse', recorte, 'areverse']
    filtros.append(f"apad=pad_dur={CFG['mp3'].get('colaSegundos', 0.02)}")
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(wav), '-ar', str(f), '-af', ','.join(filtros), '-ac', '1', '-b:a', CFG['mp3']['bitrate'], str(mp3)], check=True)


def texto_para_voz(clave: str, texto: str) -> str:
    """Los pedacitos que van en el medio de una frase (números y textos sin punto final) se leen
    con una coma al final: así la voz no "cierra" la frase y al unirlos suena de corrido."""
    t = texto.strip()
    if clave.startswith(('n-', 'm-')) or not t.endswith(('.', '?', '!', '…', ':')):
        return t + ','
    return t


def decir(c: dict, texto: str, mp3: Path):
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / 'a.wav'
        (piper_wav if c['motor'] == 'piper' else kokoro_wav)(c, texto, wav)
        a_mp3(wav, mp3, c.get('semitonos', 0))


def elegir(candidatas: list) -> dict:
    for c in candidatas:
        try:
            lic = licencia_piper(c['modelo']) if c['motor'] == 'piper' else 'Apache-2.0'
            if c['motor'] == 'kokoro':
                LICENCIAS['kokoro-v1.0'] = {'motor': 'kokoro', 'licencia': 'Apache-2.0', 'fuente': 'hexgrad/Kokoro-82M y thewh1teagle/kokoro-onnx'}
            if permitida(lic):
                return c
            print(f'  descartada {c.get("modelo") or c.get("voz")}: licencia "{lic}" no permite uso comercial')
        except Exception as e:  # sin red o modelo inexistente: se prueba la siguiente
            print('  no se pudo usar', c, e)
    raise SystemExit('Ninguna voz candidata tiene licencia válida')


# Cambiar este número obliga a regenerar todos los audios (por ejemplo, si cambia cómo se procesan).
VERSION_PROCESO = 2


def hash_cfg(c: dict) -> str:
    return hashlib.sha1(json.dumps({**c, 'mp3': CFG['mp3'], 'proceso': VERSION_PROCESO}, sort_keys=True).encode()).hexdigest()[:12]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--solo-muestras', action='store_true')
    ap.add_argument('--limite', type=int, default=0)
    # Para no pasarse del tiempo de GitHub: guarda lo hecho y sigue en la próxima corrida.
    ap.add_argument('--minutos', type=float, default=float(os.environ.get('MINUTOS_VOZ', 0)))
    args = ap.parse_args()
    MODELOS.mkdir(parents=True, exist_ok=True)

    # Muestras para comparar voces
    dm = RAIZ / 'docs' / 'voces-muestras'
    dm.mkdir(parents=True, exist_ok=True)
    for c in CFG['muestras']['candidatas']:
        try:
            lic = licencia_piper(c['modelo']) if c['motor'] == 'piper' else 'Apache-2.0'
            for i, f in enumerate(CFG['muestras']['frases']):
                destino = dm / f'{c["nombre"]}-{i + 1}.mp3'
                if not destino.exists():
                    decir(c, f, destino)
            print('  muestra', c['nombre'], lic)
        except Exception as e:
            print('  sin muestra para', c['nombre'], e)
    if args.solo_muestras:
        guardar_licencias({})
        return

    manifiesto = json.loads((RAIZ / 'content/audio/manifiesto.json').read_text())['claves']
    import time
    fin = time.time() + args.minutos * 60 if args.minutos else None
    elegidas = {}
    for guia, g in CFG['guias'].items():
        c = elegir(g['candidatas'])
        elegidas[guia] = c
        h = hash_cfg(c)
        carpeta = RAIZ / 'content' / 'audio' / guia
        carpeta.mkdir(parents=True, exist_ok=True)
        idx_path = carpeta / 'index.json'
        previo = json.loads(idx_path.read_text()) if idx_path.exists() else {}
        if previo.get('hash') != h:
            for f in carpeta.glob('*.mp3'):
                f.unlink()
        hechos = 0
        for clave, texto in manifiesto.items():
            mp3 = carpeta / f'{clave}.mp3'
            if mp3.exists():
                continue
            try:
                decir(c, texto_para_voz(clave, texto), mp3)
            except Exception as e:
                print('  error con', clave, texto, e)
                continue
            hechos += 1
            if hechos % 200 == 0:
                print(f'  {guia}: {hechos} audios nuevos', flush=True)
            if args.limite and hechos >= args.limite:
                break
            if fin and time.time() > fin:
                print(f'  {guia}: se terminó el tiempo; sigue en la próxima corrida', flush=True)
                (RAIZ / '.faltan-voces').write_text('si')
                break
        # Se borran audios que ya no se usan.
        for f in carpeta.glob('*.mp3'):
            if f.stem not in manifiesto:
                f.unlink()
        claves = sorted(f.stem for f in carpeta.glob('*.mp3'))
        idx_path.write_text(json.dumps({'voz': c, 'hash': h, 'claves': claves}, ensure_ascii=False) + '\n')
        print(f'{guia}: {len(claves)} audios ({hechos} nuevos) con {c.get("modelo") or c.get("voz")}')
    guardar_licencias(elegidas)


def guardar_licencias(elegidas: dict):
    (RAIZ / 'docs' / 'voces-licencias.json').write_text(json.dumps({'elegidas': elegidas, 'verificadas': LICENCIAS}, ensure_ascii=False, indent=1) + '\n')


if __name__ == '__main__':
    main()
