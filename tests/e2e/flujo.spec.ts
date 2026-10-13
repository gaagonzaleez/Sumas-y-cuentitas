import { expect, type Page, test } from '@playwright/test';

const FOTOS = process.env.FOTOS; // carpeta opcional para guardar capturas

async function foto(page: Page, nombre: string) {
  if (FOTOS) await page.screenshot({ path: `${FOTOS}/${nombre}.png`, fullPage: true });
}

async function tocarDibujos(page: Page, nombres: string[]) {
  for (const n of nombres) await page.getByRole('button', { name: n, exact: true }).click();
}

test('una nena nueva crea su avatar y llega al mapa, y juega un ejercicio', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'mateAventuras' })).toBeVisible();
  await foto(page, '00-bienvenida');
  await page.getByRole('button', { name: 'Empezar' }).click();

  // Cuenta de la adulta
  await page.getByLabel('Tu correo').fill('mama@ejemplo.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('secreta123');
  await page.getByLabel('Repetí la contraseña').fill('secreta123');
  await page.getByRole('button', { name: 'Seguir' }).click();

  // Pantalla 1: perfil de la nena (con validación de apodo)
  await expect(page.getByRole('heading', { name: 'Creá el perfil de tu hija' })).toBeVisible();
  await page.getByLabel('Apodo de juego').fill('Sofía');
  await page.getByRole('button', { name: 'Crear perfil' }).click();
  await expect(page.getByText('Parece un nombre real')).toBeVisible();
  await page.getByLabel('Apodo de juego').fill('Estrellita');
  await page.getByRole('checkbox').check();
  await foto(page, '01-perfil');
  await page.getByRole('button', { name: 'Crear perfil' }).click();

  // Elegir dibujos secretos (dos veces)
  await expect(page.getByText('Elegí 3 dibujos secretos')).toBeVisible();
  await tocarDibujos(page, ['Pez', 'Sol', 'Gato']);
  await expect(page.getByText('Ahora tocalos otra vez')).toBeVisible();
  await tocarDibujos(page, ['Pez', 'Sol', 'Gato']);

  // Pantalla 4: guía
  await expect(page.getByRole('heading', { name: '¿Quién te acompaña?' })).toBeVisible();
  await foto(page, '04-guia');
  await page.getByRole('button', { name: '¡A jugar con Chispa!' }).click();

  // Pantalla 2: avatar
  await expect(page.getByRole('tab', { name: 'Pelo' })).toBeVisible();
  await page.getByRole('tab', { name: 'Pelo' }).click();
  await page.getByRole('button', { name: 'Rulos', exact: true }).click();
  await foto(page, '02-avatar');
  await page.getByRole('button', { name: '¡Me encanta! Seguir' }).click();

  // Pantalla 3: mascota
  await expect(page.getByRole('heading', { name: 'Elegí tu mascota' })).toBeVisible();
  await page.getByLabel('Ponele un nombre').fill('Dragui');
  await foto(page, '03-mascota');
  await page.getByRole('button', { name: 'Quiero a Dragui' }).click();

  // Pantalla 5: mapa
  await expect(page.getByRole('button', { name: /Isla de los Números/ })).toBeVisible();
  await foto(page, '05-mapa');
  await page.getByRole('button', { name: /Isla de los Números/ }).click();
  await page.getByRole('button', { name: /Nivel 1: Contar/ }).click();

  // Pantalla 10: grados
  await expect(page.getByRole('heading', { name: 'Grado 1' })).toBeVisible();
  await foto(page, '10-grados');
  await page.getByRole('button', { name: 'Jugar' }).click();

  // Pantalla 6: ejercicio. Responde mal dos veces para ver la minilección (pantalla 9).
  await expect(page.getByText(/Pregunta 1 de 15/)).toBeVisible();
  await foto(page, '06-ejercicio');
  // Toca opciones hasta equivocarse dos veces en el mismo ejercicio (si acierta, sigue con otro).
  for (let intento = 0; intento < 20; intento++) {
    if (await page.getByRole('button', { name: 'Siguiente paso' }).isVisible()) break;
    if (await page.getByRole('button', { name: 'Seguir' }).isVisible()) {
      await page.getByRole('button', { name: 'Seguir' }).click();
      continue;
    }
    if (await page.getByLabel('Escribí el número con letras').isVisible()) {
      await page.getByLabel('Escribí el número con letras').fill('xyz');
      await page.getByRole('button', { name: 'Listo' }).click();
    } else if (await page.getByRole('button', { name: 'Listo' }).isVisible()) {
      // Ejercicio con teclado: una respuesta que nunca es correcta en estos niveles.
      for (const t of ['9', '9', '9', '9']) await page.getByRole('button', { name: t, exact: true }).click();
      await page.getByRole('button', { name: 'Listo' }).click();
    } else {
      const numerica = page.locator('main button:enabled').filter({ hasText: /^\d+$/ });
      // Guerra de cartas: las opciones son nombres ("Vos", "Empate"), no números.
      if (await numerica.count()) await numerica.first().click();
      else await page.locator('main button:enabled').filter({ hasText: /^(Vos|Empate)$/ }).first().click();
    }
    await page.waitForTimeout(150);
    if (await page.getByText(/Casi/).first().isVisible()) await expect(page.getByText(/Casi/).first()).toBeVisible();
  }
  await expect(page.getByRole('button', { name: 'Siguiente paso' })).toBeVisible();
  await foto(page, '09-leccion');
  await page.getByRole('button', { name: 'Siguiente paso' }).click();
  await page.getByRole('button', { name: 'Siguiente paso' }).click();
  await page.getByRole('button', { name: '¡Probemos!' }).click();
  await expect(page.getByText(/parecida/)).toBeVisible();

  // Mi mascota, tienda y grupo
  await page.goto('./#/mascota');
  await expect(page.getByRole('heading', { name: 'Dragui' })).toBeVisible();
  await foto(page, '07-mascota');
  await page.goto('./#/tienda');
  await expect(page.getByText('Ofertas de la semana')).toBeVisible();
  await foto(page, '12-tienda');
  await page.goto('./#/grupo');
  await expect(page.getByRole('heading', { name: 'Jugás sin grupo' })).toBeVisible();

  // Al recargar (por ejemplo, al actualizarse), sigue adentro sin pedir los dibujos.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Jugás sin grupo' })).toBeVisible();

  // Al salir, pide los 3 dibujos para volver a entrar.
  await page.goto('./#/ajustes');
  await page.getByRole('button', { name: 'Salir' }).click();
  await expect(page.getByText('Tocá tus 3 dibujos secretos')).toBeVisible();
  await foto(page, '15-entrar');
  await tocarDibujos(page, ['Sol', 'Sol', 'Sol']);
  await expect(page.getByText(/Esos no eran/)).toBeVisible();
  await page.waitForTimeout(800);
  await tocarDibujos(page, ['Pez', 'Sol', 'Gato']);
  await expect(page.getByRole('button', { name: /Isla de los Números/ })).toBeVisible();

  // Panel de la adulta: pide contraseña y permite borrar el perfil.
  await page.goto('./#/adulta/panel');
  await page.getByLabel('Contraseña de la adulta').fill('secreta123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText('Panel para adultas')).toBeVisible();
  await foto(page, '14-panel');
  await page.getByRole('button', { name: 'Borrar perfil' }).click();
  await page.getByRole('button', { name: 'Sí, borrar todo' }).click();
  await expect(page.getByText('Todavía no hay perfiles.')).toBeVisible();
});

test('todos los botones miden al menos 44 px', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Empezar' }).click();
  const chicos = await page.locator('button:visible').evaluateAll((bs) =>
    bs.map((b) => b.getBoundingClientRect()).filter((r) => r.height < 44 || r.width < 44).length,
  );
  expect(chicos).toBe(0);
});
