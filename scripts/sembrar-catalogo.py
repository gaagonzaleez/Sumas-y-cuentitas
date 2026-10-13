# Arma el catálogo inicial de ítems del avatar, premios y sets de jefes (content/avatar/*.json).
# Se corrió una vez para sembrar el catálogo. Para sumar ítems nuevos cada mes alcanza con
# agregar una entrada en content/avatar/items.json (y su SVG en content/avatar/svg/ si es un dibujo nuevo).
import json
C = {'violeta':'#5B3FE0','turquesa':'#0FA88F','coral':'#E8505B','amarillo':'#FFC93C','rosa':'#F28FB8','celeste':'#7CC6F2',
     'lila':'#9A7BF0','verde':'#3DBE7A','naranja':'#F29A2E','blanco':'#FFFFFF','tinta':'#2B2350','azul':'#3B6FD9','marron':'#8A5A3B',
     'crema':'#FFF4D1','dorado':'#E8B21F','menta':'#D7F5EE','rojo':'#D93A45','negro':'#3A3350'}
items = []
def dorado(n):
    # Concuerda con la primera palabra: botas doradas, zapatitos dorados, flor dorada.
    w = n.split()[0]
    return 'doradas' if w.endswith('as') else 'dorados' if w.endswith('os') else 'dorada' if w.endswith('a') or w == 'Flor' else 'dorado'
def it(id, capa, nombre, svg, rareza='comun', desbloqueo='tienda', tela=None, tela2=None, atras=None, **kw):
    d = {'id': id, 'capa': capa, 'nombre': nombre, 'svg': svg}
    if atras: d['svgAtras'] = atras
    col = {}
    if tela: col['tela'] = C.get(tela, tela)
    if tela2: col['tela2'] = C.get(tela2, tela2)
    if col: d['colores'] = col
    d['rareza'] = rareza; d['desbloqueo'] = desbloqueo
    d.update(kw)
    items.append(d)
# --- Pelo ---
pelos = [('largo','Largo','gratis'),('corto','Corto','gratis'),('rulos','Rulos','gratis'),('colitas','Colitas','gratis'),
         ('trenzas','Trenzas','lindo'),('rodete','Rodete','comun'),('chonguitos','Dos rodetes','lindo'),('ondas','Ondas','comun'),
         ('afro','Afro','comun'),('carre','Carré','comun'),('flequillo','Flequillo recto','comun'),('media-cola','Media cola','lindo'),
         ('cola-alta','Cola alta','lindo'),('rapado','Cortito','comun')]
for s,n,r in pelos:
    it(f'pelo-{s}','pelo',n,f'pelo-{s}',atras=f'pelo-{s}.atras' if s!='rapado' else None,
       rareza='comun' if r=='gratis' else r, desbloqueo='gratis' if r=='gratis' else 'tienda', tela2='coral')
colores = [('negro','Negro','#2A2238','gratis'),('castano','Castaño','#6B3F27','gratis'),('rubio','Rubio','#E7C15A','gratis'),('colorado','Colorado','#C4572A','gratis'),
           ('castano-oscuro','Castaño oscuro','#4B2E22','comun'),('castano-claro','Castaño claro','#9A6236','comun'),('rubio-claro','Rubio claro','#F2DC8C','comun'),
           ('cobre','Cobre','#A8431F','comun'),('rosa','Rosa','#F28FB8','comun'),('celeste','Celeste','#7CC6F2','comun'),('violeta','Violeta','#9A7BF0','comun'),('arcoiris','Arcoíris','arcoiris','brillante')]
for s,n,v,r in colores:
    d={'id':f'color-{s}','capa':'colorPelo','nombre':f'Pelo {n.lower()}','valor':v,'rareza':'comun' if r=='gratis' else r,'desbloqueo':'gratis' if r=='gratis' else 'tienda'}
    items.append(d)
# --- Ropa ---
it('remera-violeta','arriba','Remera violeta','remera',desbloqueo='gratis',tela='violeta')
it('remera-turquesa','arriba','Remera turquesa','remera',desbloqueo='gratis',tela='turquesa')
it('remera-coral','arriba','Remera coral','remera',tela='coral')
it('remera-rayada','arriba','Remera rayada','remera-rayada',tela='blanco',tela2='celeste')
it('remera-rayada-rosa','arriba','Remera rayada rosa','remera-rayada',tela='blanco',tela2='rosa')
it('remera-estrella','arriba','Remera con estrella','remera-estrella','lindo',tela='lila',tela2='amarillo')
it('remera-corazon','arriba','Remera con corazón','remera-corazon','lindo',tela='crema',tela2='coral')
it('musculosa-amarilla','arriba','Musculosa amarilla','musculosa',tela='amarillo')
it('buzo-verde','arriba','Buzo verde','buzo','lindo',tela='verde',tela2='crema')
it('buzo-rosa','arriba','Buzo rosa','buzo','lindo',tela='rosa',tela2='blanco')
it('campera-azul','arriba','Campera azul','campera','especial',tela='azul',tela2='celeste')
it('campera-roja','arriba','Campera roja','campera','especial',tela='rojo',tela2='amarillo')
it('blusa-volados','arriba','Blusa con volados','blusa-volados','lindo',tela='menta',tela2='blanco')
it('pantalon-azul','abajo','Pantalón azul','pantalon',desbloqueo='gratis',tela='azul')
it('pollera-rosa','abajo','Pollera rosa','pollera',desbloqueo='gratis',tela='rosa')
it('pantalon-negro','abajo','Pantalón oscuro','pantalon',tela='negro')
it('short-celeste','abajo','Short celeste','short',tela='celeste')
it('pollera-violeta','abajo','Pollera violeta','pollera',tela='violeta')
it('pollera-tul','abajo','Pollera de tul','pollera-tul','especial',tela='#F7B6D2')
it('calza-lila','abajo','Calza lila','calza',tela='lila',tela2='blanco')
it('jardinero','abajo','Jardinero','jardinero','lindo',tela='azul',tela2='amarillo')
it('vestido-violeta','vestido','Vestido violeta','vestido','lindo',tela='violeta',tela2='lila')
it('vestido-amarillo','vestido','Vestido amarillo','vestido','lindo',tela='amarillo',tela2='blanco')
it('vestido-volados','vestido','Vestido con volados','vestido-volados','especial',tela='coral',tela2='rosa')
it('vestido-estrellas','vestido','Vestido de estrellas','vestido-estrellas','raro',tela='tinta',tela2='amarillo')
it('mameluco-turquesa','vestido','Mameluco turquesa','mameluco','lindo',tela='turquesa',tela2='amarillo')
# --- Calzado ---
it('zapatillas-blancas','calzado','Zapatillas','zapatillas',desbloqueo='gratis',tela='violeta')
it('zapatitos-rojos','calzado','Zapatitos rojos','zapatitos',desbloqueo='gratis',tela='coral',tela2='blanco')
it('zapatitos-rosas','calzado','Zapatitos rosas','zapatitos','especial',tela='rosa',tela2='blanco')
it('zapatillas-turquesa','calzado','Zapatillas turquesa','zapatillas','lindo',tela='turquesa')
it('botas-marrones','calzado','Botas','botas','especial',tela='marron',tela2='crema')
it('botas-lluvia','calzado','Botas de lluvia','botas','lindo',tela='amarillo',tela2='coral')
it('sandalias','calzado','Sandalias','sandalias',tela='coral')
# --- Accesorios ---
it('mono-rojo','cabeza','Moño rojo','mono',tela='coral',tela2='amarillo')
it('mono-violeta','cabeza','Moño violeta','mono','lindo',tela='violeta',tela2='rosa')
it('vincha-rosa','cabeza','Vincha rosa','vincha',tela='rosa')
it('vincha-gatito','cabeza','Vincha de gatito','vincha-orejitas','especial',tela='tinta',tela2='rosa')
it('gorro-turquesa','cabeza','Gorro turquesa','gorro','lindo',tela='turquesa',tela2='blanco')
it('gorra-violeta','cabeza','Gorra','gorra','lindo',tela='violeta',tela2='amarillo')
it('sombrero-paja','cabeza','Sombrero de paja','sombrero','especial',tela='#F2DC8C',tela2='coral')
it('flor-pelo','cabeza','Flor para el pelo','flor-pelo',tela='rosa',tela2='amarillo')
it('estrella-pelo','cabeza','Hebilla de estrella','estrella-pelo',tela='amarillo')
it('tiara','cabeza','Tiara','tiara','raro',tela='lila',tela2='celeste')
it('auriculares','cabeza','Auriculares','auriculares','especial',tela='coral',tela2='tinta')
it('anteojos-lindos','cara','Anteojos lindos','anteojos','especial',tela='tinta')
it('anteojos-rosas','cara','Anteojos rosas','anteojos','especial',tela='rosa')
it('anteojos-sol','cara','Anteojos de sol','anteojos-sol','lindo',tela='tinta')
it('collar-perlas','cuello','Collar de perlas','collar','lindo',tela='lila',tela2='blanco')
it('collar-corazon','cuello','Collar de corazón','collar-corazon','especial',tela='dorado',tela2='coral')
it('bufanda','cuello','Bufanda','bufanda','lindo',tela='coral',tela2='blanco')
it('mochila-violeta','espalda','Mochila','mochila','lindo',tela='violeta',tela2='amarillo',svgFrente='mochila-tiras')
it('alas-cristal','espalda','Alas de cristal','alas','raro',desbloqueo='premio',tela='#CDE9FF')
it('globo-rojo','mano','Globo','globo',tela='coral')
it('varita','mano','Varita mágica','varita','raro',tela='amarillo',tela2='lila')
it('ramo','mano','Ramito de flores','ramo','lindo',tela='rosa',tela2='verde')
it('pecas','detalle','Pecas','pecas',desbloqueo='gratis')
it('brillos','detalle','Brillos de fiesta','brillos','lindo')
it('curita','detalle','Curita','curita')
# --- Fondos y marcos ---
for s,n,r in [('lila','Lila','gratis'),('cielo','Cielo','gratis'),('rosa','Rosa','gratis'),('jardin','Jardín','comun'),('noche','Noche estrellada','lindo'),
              ('playa','Playa','lindo'),('arcoiris','Arcoíris','especial'),('castillo','Castillo','raro'),('mar','Fondo del mar','lindo')]:
    it(f'fondo-{s}','fondo',n,f'fondo-{s}',rareza='comun' if r=='gratis' else r,desbloqueo='gratis' if r=='gratis' else 'tienda')
it('marco-estrellas','marco','Marco de estrellas','marco-estrellas','especial',tela='violeta',tela2='amarillo')
it('marco-flores','marco','Marco de flores','marco-flores','especial',tela='verde',tela2='rosa')
it('marco-corazones','marco','Marco de corazones','marco-corazones','especial',tela='rosa',tela2='coral')

# --- Premios por nivel (no se compran) ---
MUNDOS = {
 'isla':   ('#7CC6F2','#FFC93C', ['Remera marinera','Sombrero de la isla','Collar de caracolas','Sandalias de arena','Vestido de olas','Moño de estrella de mar','Short de playa','Anteojos de sol isleños'],
            ['Corona de caracolas','Varita de coral','Collar de perlas del mar','Alas de espuma','Tiara de la isla','Ramo de flores de la isla','Hebilla de estrella de mar','Capa de olas']),
 'valle':  ('#3DBE7A','#F28FB8', ['Remera de flores','Vincha de hojas','Pollera del valle','Botas del jardín','Vestido de margaritas','Moño de pétalos','Buzo del valle','Collar de semillas'],
            ['Corona de flores','Varita de girasol','Alas de mariposa','Tiara de rocío','Ramo encantado','Collar de capullos','Hebilla de abeja','Capa de pétalos']),
 'montana':('#9A7BF0','#FFFFFF', ['Campera de nieve','Gorro de montaña','Bufanda de lana','Botas de nieve','Pantalón de alpinista','Mochila exploradora','Remera de cumbre','Anteojos de nieve'],
            ['Corona de cristal de hielo','Varita de copo de nieve','Alas de nube','Tiara de escarcha','Collar de piedras brillantes','Capa de la cumbre','Hebilla de copo','Mochila dorada de cumbre']),
 'bosque': ('#0FA88F','#E8505B', ['Vestido del bosque','Gorrito de hongo','Mameluco de hojas','Botas de musgo','Remera de bellotas','Collar de bayas','Vincha de ramitas','Pollera de hojas'],
            ['Corona del bosque','Varita de rama mágica','Alas de hada','Tiara de luciérnagas','Capa de hojas doradas','Collar de rocío','Ramo del bosque','Hebilla de hongo']),
 'mercado':('#E8505B','#FFC93C', ['Delantal del mercado','Gorra de la feria','Remera de frutas','Zapatitos de la feria','Pollera de rayas','Bolsito de compras','Pañuelo del puesto','Vestido de la tendera'],
            ['Corona de monedas','Varita de la balanza','Collar de monedas','Alas de billete','Tiara de oro','Capa del mercado','Ramo de frutas','Hebilla de moneda']),
 'pueblo': ('#5B3FE0','#FFC93C', ['Piloto de detective','Sombrero del pueblo','Remera de lupas','Botas del pueblo','Jardinero del pueblo','Anteojos de detective','Bufanda de la plaza','Vestido de la plaza'],
            ['Corona del pueblo','Lupa mágica','Collar de llaves','Alas de farol','Tiara del reloj','Capa de detective','Ramo de la plaza','Hebilla de lupa']),
 'tesoro': ('#E8B21F','#E8505B', ['Remera pirata','Pañuelo de capitana','Pantalón del barco','Botas del tesoro','Vestido del cofre','Collar del mapa','Gorra de marinera','Chaleco del tesoro'],
            ['Corona del tesoro','Varita de brújula','Collar de monedas de oro','Alas de vela','Tiara de piedras preciosas','Capa de capitana','Ramo de joyas','Hebilla de ancla']),
}
FORMAS_NIVEL = [('remera-estrella','arriba'),('sombrero','cabeza'),('collar','cuello'),('zapatitos','calzado'),('vestido','vestido'),('mono','cabeza'),('short','abajo'),('anteojos-sol','cara')]
FORMAS_NIVEL_ALT = {'montana': {0:('campera','arriba'),1:('gorro','cabeza'),2:('bufanda','cuello'),3:('botas','calzado'),4:('pantalon','abajo'),5:('mochila','espalda'),7:('anteojos','cara')},
                    'bosque': {1:('gorro','cabeza'),2:('collar','cuello'),3:('botas','calzado'),4:('remera-estrella','arriba'),5:('collar-corazon','cuello'),6:('vincha','cabeza'),7:('pollera-tul','abajo'),2.0:None},
                    'pueblo': {0:('campera','arriba'),4:('jardinero','abajo'),5:('anteojos','cara'),6:('bufanda','cuello')}}
FORMAS_RARAS = [('corona','cabeza'),('varita','mano'),('collar','cuello'),('alas','espalda'),('tiara','cabeza'),('ramo','mano'),('estrella-pelo','cabeza'),('capa','espalda')]
RARAS_ALT = {'pueblo': {1:('varita','mano'),2:('collar-corazon','cuello')}}
premios = {'niveles': {}, 'jefes': {}}
for mid,(c1,c2,nombresN,nombresR) in MUNDOS.items():
    for i in range(8):
        nid = f'{mid}-{i+1}'
        forma, capa = FORMAS_NIVEL_ALT.get(mid, {}).get(i) or FORMAS_NIVEL[i]
        extra = {'svgFrente':'mochila-tiras'} if forma=='mochila' else {}
        it(f'premio-{nid}', capa, nombresN[i], forma, 'especial', 'premio', tela=c1, tela2=c2, mundo=mid, **extra)
        formaR, capaR = RARAS_ALT.get(mid, {}).get(i) or FORMAS_RARAS[i]
        it(f'raro-{nid}', capaR, nombresR[i], formaR, 'raro', 'premio', tela=c2 if formaR in ('corona','tiara','estrella-pelo') else c1, tela2=c1 if formaR in ('corona','tiara') else c2, mundo=mid, brilla=True)
        premios['niveles'][nid] = {'grado1': f'premio-{nid}', 'todos': f'raro-{nid}', 'estampita': f'estampita-{nid}'}
JEFES = {
 'isla': ('Exploradora de la Isla', [('tunica','vestido','Traje de exploradora','#F2DC8C','#3DBE7A'),('sombrero','cabeza','Sombrero de exploradora','#F2DC8C','#E8505B'),('botas','calzado','Botas de exploradora','#8A5A3B','#FFC93C'),('mochila','espalda','Mochila de exploradora','#3DBE7A','#FFC93C'),('globo','mano','Catalejo de colores','#FFC93C','#2B2350')]),
 'valle': ('Jardinera Mágica', [('vestido-volados','vestido','Vestido de jardinera','#3DBE7A','#F28FB8'),('flor-pelo','cabeza','Flor mágica','#F28FB8','#FFC93C'),('zapatitos','calzado','Zapatitos de pétalo','#F28FB8','#FFFFFF'),('alas','espalda','Alas de mariposa mágica','#F7B6D2',None),('ramo','mano','Regadera de flores','#F28FB8','#3DBE7A')]),
 'montana': ('Alpinista', [('campera','arriba','Campera de alpinista','#E8505B','#FFC93C'),('gorro','cabeza','Gorro de alpinista','#E8505B','#FFFFFF'),('botas','calzado','Botas de alpinista','#5B3FE0','#FFFFFF'),('mochila','espalda','Mochila de alpinista','#5B3FE0','#FFC93C'),('varita','mano','Bastón de cumbre','#FFFFFF','#7CC6F2')]),
 'bosque': ('Hada del Bosque', [('vestido-estrellas','vestido','Vestido del hada','#3DBE7A','#FFC93C'),('corona','cabeza','Corona del Hada del Bosque','#FFC93C','#E8505B'),('zapatitos','calzado','Zapatitos del hada','#0FA88F','#FFC93C'),('alas','espalda','Alas del hada','#D7F5EE',None),('varita','mano','Varita del hada','#FFC93C','#3DBE7A')]),
 'mercado': ('Tendera del Mercado', [('blusa-volados','arriba','Blusa de la tendera','#FFE3E6','#E8505B'),('gorra','cabeza','Gorra de la tendera','#E8505B','#FFC93C'),('zapatillas','calzado','Zapatillas de la tendera','#E8505B',None),('capa','espalda','Delantal largo','#FFC93C',None),('ramo','mano','Canasta de frutas','#E8505B','#3DBE7A')]),
 'pueblo': ('Detective', [('campera','arriba','Piloto de detective','#C9A46A','#8A5A3B'),('sombrero','cabeza','Sombrero de detective','#8A5A3B','#2B2350'),('botas','calzado','Botas de detective','#2B2350','#8A5A3B'),('capa','espalda','Capa de detective','#8A5A3B',None),('globo','mano','Lupa gigante','#CDE9FF','#2B2350')]),
 'tesoro': ('Capitana del Tesoro', [('tunica','vestido','Traje de capitana','#2B2350','#E8B21F'),('sombrero','cabeza','Sombrero de capitana','#2B2350','#E8B21F'),('botas','calzado','Botas de capitana','#2B2350','#E8B21F'),('capa','espalda','Capa de capitana','#E8505B',None),('varita','mano','Brújula mágica','#E8B21F','#E8505B')]),
}
sets = []
for mid,(nombre,piezas) in JEFES.items():
    ids, dorados = [], []
    for g,(forma,capa,n,t,t2) in enumerate(piezas, start=1):
        extra = {'svgFrente':'mochila-tiras'} if forma=='mochila' else {}
        iid = f'jefe-{mid}-{g}'
        it(iid, capa, n, forma, 'magico', 'premio', tela=t, tela2=t2 or '#FFFFFF', mundo=mid, **extra)
        ids.append(iid)
        did = f'jefe-{mid}-{g}-dorado'
        it(did, capa, f"{n} {dorado(n)}", forma, 'legendario', 'premio', tela='#E8B21F', tela2='#FFF4D1', mundo=mid, brilla=True, **extra)
        dorados.append(did)
    it(f'marco-dorado-{mid}', 'marco', f"Marco dorado {'del' if nombre.startswith('Hada') else 'de la'} {nombre}", 'marco-estrellas', 'legendario', 'premio', tela='#E8B21F', tela2='#FFF4D1', mundo=mid)
    sets.append({'id': f'set-{mid}', 'nombre': nombre, 'mundo': mid, 'items': ids, 'dorado': dorados + [f'marco-dorado-{mid}']})
    # Grado 1: el avatar completo de esa versión (ropa, cabeza y calzado). Cada grado siguiente suma una pieza más imponente.
    premios['jefes'][mid] = {'grados': {'1': ids[:3], '2': [ids[3]], '3': [ids[4]], '4': [f'jefe-{mid}-1-dorado'], '5': [f'jefe-{mid}-2-dorado']},
                             'todos': dorados[2:] + [f'marco-dorado-{mid}']}
# Mascotas: accesorios para vestir a la mascota
pet = [('mono','Moñito','coral'),('gorrito','Gorrito de fiesta','violeta'),('anteojos','Anteojitos','tinta'),('corona','Coronita','amarillo'),('bufanda','Bufandita','turquesa'),('flor','Florcita','rosa')]
for s,n,c in pet:
    items.append({'id':f'mascota-{s}','capa':'mascota','nombre':n,'svg':s,'colores':{'tela':C[c]},'rareza':'comun' if s in('mono','flor') else 'lindo','desbloqueo':'tienda'})
json.dump({'_nota':'Catálogo de ítems. capa: dónde va. desbloqueo: gratis, tienda (con monedas) o premio (no se compra). El precio sale de la rareza (content/config/economia.json) salvo que se indique "precio". colores: valores de --tela y --tela2 del SVG.','items':items}, open('content/avatar/items.json','w'), ensure_ascii=False, indent=1)
json.dump({'_nota':'Premios únicos por logro. grado1: al completar el grado 1 del nivel. todos: al completar los 5 grados (más la estampita). jefes.grados: lo que da cada versión del jefe. jefes.todos: versión dorada y marco.','niveles':premios['niveles'],'jefes':premios['jefes'],'sets':sets}, open('content/premios.json','w'), ensure_ascii=False, indent=1)
print(len(items),'ítems', sum(1 for i in items if i['desbloqueo']!='premio'),'comprables/gratis')
