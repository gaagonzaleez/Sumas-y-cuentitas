#!/usr/bin/env python3
"""Genera las mismas frases con varias voces gratuitas para comparar cuál suena más natural.

Deja los mp3 y una página para escucharlos en public/muestras-voz/ (se publica con la app en
/muestras-voz/). Anota cuánto tarda cada voz (para saber si se pueden generar todos los audios).

Uso: python scripts/voz/comparar.py
"""
import html, json, sys, tempfile, time, traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import generar as g  # noqa: E402

SALIDA = g.RAIZ / 'public' / 'muestras-voz'
FRASES = [
    '¡Hola! Soy Chispa. ¿Lista para jugar conmigo?',
    '¡Casi! No pasa nada, equivocarse también es aprender. Probá otra vez.',
    'Martina tenía ciento veinte figuritas y le regalaron cuarenta y cinco más. ¿Cuántas tiene ahora?',
    '¡Genial, lo lograste! Sumaste dos monedas.',
]
REFERENCIA = ('Hola, ¿cómo estás? Hoy vamos a jugar con los números. Vamos a sumar, a restar '
              'y a contar estrellitas. ¡Va a ser muy divertido!')


def mp3(wav: Path, destino: Path):
    g.a_mp3(wav, destino, 0)


_chatter = {}


def chatterbox(texto: str, wav: Path, ref: Path | None, exageracion: float, cfg: float):
    import torch
    import torchaudio as ta
    if 'm' not in _chatter:
        carga = torch.load
        torch.load = lambda *a, **k: carga(*a, **{**k, 'map_location': 'cpu'})  # pesos guardados en GPU
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        _chatter['m'] = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
    m = _chatter['m']
    kw = {'language_id': 'es', 'exaggeration': exageracion, 'cfg_weight': cfg}
    if ref:
        kw['audio_prompt_path'] = str(ref)
    w = m.generate(texto, **kw)
    ta.save(str(wav), w, m.sr)


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkdtemp())
    resultados = []

    # Referencias (voces sintéticas con licencia libre) para que Chatterbox imite su timbre.
    refs = {}
    try:
        g.piper_wav(g.CFG['guias']['chispa']['candidatas'][0] | {'semitonos': 0}, REFERENCIA, tmp / 'ref-daniela.wav')
        refs['daniela'] = tmp / 'ref-daniela.wav'
    except Exception:
        traceback.print_exc()
    try:
        g.kokoro_wav({'voz': 'ef_dora', 'velocidad': 1.0}, REFERENCIA, tmp / 'ref-dora.wav')
        refs['dora'] = tmp / 'ref-dora.wav'
    except Exception:
        traceback.print_exc()

    candidatas = [
        ('actual-chispa', 'Voz actual de Chispa (Piper, acento argentino)', lambda t, w: g.piper_wav(g.CFG['guias']['chispa']['candidatas'][0], t, w)),
        ('actual-cande', 'Voz actual de la Seño Cande (Piper, acento mexicano)', lambda t, w: g.piper_wav(g.CFG['guias']['cande']['candidatas'][0], t, w)),
        ('kokoro-dora', 'Kokoro, voz Dora', lambda t, w: g.kokoro_wav({'voz': 'ef_dora', 'velocidad': 1.0}, t, w)),
        ('chatterbox', 'Chatterbox, voz propia en español', lambda t, w: chatterbox(t, w, None, 0.5, 0.5)),
        ('chatterbox-alegre', 'Chatterbox, voz propia, más alegre', lambda t, w: chatterbox(t, w, None, 0.8, 0.4)),
        ('chatterbox-daniela', 'Chatterbox imitando a la voz argentina', lambda t, w: chatterbox(t, w, refs.get('daniela'), 0.6, 0.5)),
        ('chatterbox-dora', 'Chatterbox imitando a Dora', lambda t, w: chatterbox(t, w, refs.get('dora'), 0.6, 0.5)),
    ]
    for clave, nombre, f in candidatas:
        archivos, segundos_gen, segundos_audio, error = [], 0.0, 0.0, ''
        for i, frase in enumerate(FRASES):
            wav = tmp / f'{clave}-{i}.wav'
            try:
                t0 = time.time()
                f(frase, wav)
                segundos_gen += time.time() - t0
                import soundfile as sf
                info = sf.info(str(wav))
                segundos_audio += info.frames / info.samplerate
                destino = SALIDA / f'{clave}-{i + 1}.mp3'
                mp3(wav, destino)
                archivos.append(destino.name)
            except Exception as e:
                traceback.print_exc()
                error = str(e)[:200]
                break
        rtf = segundos_gen / segundos_audio if segundos_audio else None
        print(f'{clave}: {len(archivos)} frases, tarda {rtf and round(rtf, 2)} s por segundo de audio {error}', flush=True)
        resultados.append({'clave': clave, 'nombre': nombre, 'archivos': archivos, 'tardaPorSegundo': rtf and round(rtf, 2), 'error': error})

    (SALIDA / 'resultados.json').write_text(json.dumps(resultados, ensure_ascii=False, indent=1) + '\n')
    filas = []
    for r in resultados:
        if not r['archivos']:
            continue
        audios = ''.join(f'<div class="frase"><p>{html.escape(FRASES[i])}</p><audio controls preload="none" src="{a}"></audio></div>' for i, a in enumerate(r['archivos']))
        filas.append(f'<section><h2>{html.escape(r["nombre"])}</h2>{audios}</section>')
    (SALIDA / 'index.html').write_text(f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Voces para comparar</title>
<style>
:root{{--fondo:#F6F3FF;--tinta:#2B2350;--violeta:#5B3FE0;--tarjeta:#fff}}
body{{margin:0;background:var(--fondo);color:var(--tinta);font:18px/1.45 system-ui,sans-serif;padding:20px 16px 40px}}
main{{max-width:640px;margin:0 auto}} h1{{font-size:28px;margin:0 0 6px}} h2{{font-size:21px;color:var(--violeta);margin:0 0 10px}}
section{{background:var(--tarjeta);border-radius:20px;padding:16px;margin:14px 0;box-shadow:0 3px 0 #E5DEFF}}
.frase p{{margin:8px 0 4px;font-size:16px}} audio{{width:100%;height:44px}}
</style></head><body><main>
<h1>¿Cuál voz suena mejor?</h1>
<p>Escuchá las mismas frases con cada voz y decime cuál te gusta más para Chispa y cuál para la Seño Cande.</p>
{''.join(filas)}
</main></body></html>
''')


if __name__ == '__main__':
    main()
